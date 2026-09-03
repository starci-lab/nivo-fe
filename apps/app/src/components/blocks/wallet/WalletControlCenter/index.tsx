"use client";

import { useCallback, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { useMutateCreateWalletTopUpPayLinkSwr, useMutatePayInvoiceSwr, useQueryMyInvoicesSwr, useQueryMyWalletSwr, useQueryMyWalletTransactionsSwr } from "@/hooks";
import { DEFAULT_LOCALE } from "@/i18n/config";
import type { InvoiceRow, WalletTopUpPayLink } from "@/modules/api/console";
import { BILLING_CURRENCY } from "@/modules/config";
import { WalletControlCenterBase, type BalanceSectionView, type LedgerSectionView, type LinkedInvoiceSectionView, type PaymentResultView, type TopUpView, type WalletFactRow, type WalletLedgerRow } from "./component";
type TopUpSession = {
  readonly amountVnd: number;
  readonly startingBalanceVnd: number;
  readonly referenceId: string;
};
type WalletWaypoint = {
  readonly orderId: string;
  readonly invoiceId: string;
  readonly returnTo: string;
};
const TOP_UP_SESSION_KEY = "nivo.wallet.top-up";
const invoiceTone = (status: InvoiceRow["status"]): WalletLedgerRow["tone"] => {
  if (status === "paid") return "success";
  if (status === "unpaid") return "warning";
  return "neutral";
};
type PaymentResultCopy = Pick<PaymentResultView, "state" | "tone" | "note">;
const paymentResultCopy = (isCancelled: boolean, isConfirmed: boolean, copy: Readonly<{
  cancelled: string;
  confirmed: string;
  pending: string;
  cancelledNote: string;
  confirmedNote: string;
  pendingNote: string;
}>): PaymentResultCopy => {
  if (isCancelled) return {
    state: copy.cancelled,
    tone: "neutral",
    note: copy.cancelledNote
  };
  if (isConfirmed) return {
    state: copy.confirmed,
    tone: "success",
    note: copy.confirmedNote
  };
  return {
    state: copy.pending,
    tone: "warning",
    note: copy.pendingNote
  };
};

/** Read an exact AgentOS Wallet continuation, while leaving an ordinary Wallet route uncorrelated. */
const readWalletWaypoint = (search: string, locale: string): WalletWaypoint | null | undefined => {
  const params = new URLSearchParams(search);
  const hasWaypointPart = ["orderId", "invoiceId", "returnTo"].some(key => params.has(key));
  if (!hasWaypointPart) return undefined;
  const orderId = params.get("orderId");
  const invoiceId = params.get("invoiceId");
  const returnTo = params.get("returnTo");
  const route = (path: string) => locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
  const exactReturn = orderId === null ? "" : route(`/agentos/orders/${orderId}`);
  if (orderId === null || orderId.length === 0 || invoiceId === null || invoiceId.length === 0 || returnTo !== exactReturn) return null;
  return {
    orderId,
    invoiceId,
    returnTo
  };
};
const readTopUpSession = (): TopUpSession | null => {
  try {
    const raw = sessionStorage.getItem(TOP_UP_SESSION_KEY);
    return raw === null ? null : JSON.parse(raw) as TopUpSession;
  } catch {
    return null;
  }
};

/** Connected wallet: reads ledgers, creates a real SePay checkout, and reconciles the return honestly. */
/** Page architecture context consumed by the connected Wallet block. */
export type WalletControlCenterProps = {
  readonly pageState: "ordinary" | "waypoint";
};

/** Own Wallet reads, payment mutations, correlated invoice evidence, and payment overlays. */
export const WalletControlCenter = (props: WalletControlCenterProps) => {
  const {
    pageState
  }: WalletControlCenterProps = props;
  const t = useTranslations("console");
  const format = useFormatter();
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const route = (path: string) => locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
  const waypoint = readWalletWaypoint(searchParams.toString(), locale);
  const wallet = useQueryMyWalletSwr();
  const invoices = useQueryMyInvoicesSwr();
  const transactions = useQueryMyWalletTransactionsSwr();
  const payInvoiceMutation = useMutatePayInvoiceSwr();
  const topUpMutation = useMutateCreateWalletTopUpPayLinkSwr();
  const walletAnswer = wallet.data;
  const invoicesAnswer = invoices.data;
  const movements = transactions.data;
  const [payingInvoice, setPayingInvoice] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [topUpOpen, setTopUpOpen] = useState(pathname.endsWith("/wallet/top-up"));
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpPending, setTopUpPending] = useState(false);
  const [topUpError, setTopUpError] = useState<string | undefined>();
  const [checkout, setCheckout] = useState<WalletTopUpPayLink | undefined>();
  const refresh = useCallback(async () => {
    await Promise.all([wallet.mutate(), invoices.mutate(), transactions.mutate()]);
  }, [invoices, transactions, wallet]);
  const amount = (amountVnd: number) => format.number(amountVnd, {
    style: "currency",
    currency: BILLING_CURRENCY,
    maximumFractionDigits: 0
  });
  const day = (iso: string) => format.dateTime(new Date(iso), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  const invoiceLabel = (invoice: InvoiceRow) => {
    const item = invoice.catalogOrder?.catalogItem?.name;
    const tier = invoice.catalogOrder?.catalogTier?.name;
    if (item === undefined) return t("wallet.invoicesLabel");
    return tier === undefined ? item : `${item} · ${tier}`;
  };
  const invoiceRow = (invoice: InvoiceRow): WalletLedgerRow => ({
    id: invoice.id,
    title: invoiceLabel(invoice),
    caption: t("wallet.dueAt", {
      date: day(invoice.dueAt)
    }),
    amount: amount(invoice.amountVnd),
    state: t(`wallet.status.${invoice.status}`),
    tone: invoiceTone(invoice.status),
    detailLabel: t("wallet.viewDetail"),
    detailFacts: [{
      id: "amount",
      label: t("wallet.amountLabel"),
      value: amount(invoice.amountVnd)
    }, {
      id: "due",
      label: t("wallet.dueDateLabel"),
      value: day(invoice.dueAt)
    }, {
      id: "status",
      label: t("wallet.statusLabel"),
      value: t(`wallet.status.${invoice.status}`)
    }],
    note: invoice.status === "unpaid" && paymentError !== null ? paymentError : undefined
  });
  const balanceView = (): BalanceSectionView => {
    const label = t("wallet.availableBalance");
    if (walletAnswer === undefined) return {
      phase: "resting",
      label,
      actionLabel: t("wallet.topUp")
    };
    if (!walletAnswer.ok) return {
      phase: "refused",
      label,
      note: t("refusal.unknown")
    };
    const facts: Array<WalletFactRow> = [{
      id: "balance",
      label: t("wallet.balanceLabel"),
      value: amount(walletAnswer.data.balanceVnd)
    }];
    if (invoicesAnswer?.ok === true) {
      const unpaid = invoicesAnswer.data.find(invoice => invoice.status === "unpaid");
      facts.push({
        id: "unpaid",
        label: t("wallet.unpaidLabel"),
        value: unpaid === undefined ? t("wallet.noUnpaid") : amount(unpaid.amountVnd)
      });
    }
    return {
      phase: walletAnswer.data.balanceVnd === 0 ? "empty" : "answered",
      label,
      actionLabel: t("wallet.topUp"),
      facts
    };
  };
  const transactionsView = (): LedgerSectionView => {
    const label = t("wallet.transactionsLabel");
    if (movements === undefined) return {
      phase: "resting",
      label
    };
    if (!movements.ok) return {
      phase: "refused",
      label,
      note: t("refusal.unknown")
    };
    if (movements.data.length === 0) return {
      phase: "empty",
      label,
      note: t("wallet.transactionsEmpty")
    };
    return {
      phase: "answered",
      label,
      rows: movements.data.map(movement => ({
        id: movement.id,
        title: t(`wallet.type.${movement.type}`),
        caption: day(movement.createdAt),
        amount: amount(movement.amountVnd),
        state: t(`wallet.type.${movement.type}`),
        tone: movement.type === "deposit" ? "success" : "neutral",
        detailLabel: t("wallet.viewDetail"),
        detailFacts: [{
          id: "amount",
          label: t("wallet.amountLabel"),
          value: amount(movement.amountVnd)
        }, {
          id: "date",
          label: t("wallet.dateLabel"),
          value: day(movement.createdAt)
        }, {
          id: "type",
          label: t("wallet.typeLabel"),
          value: t(`wallet.type.${movement.type}`)
        }],
        note: movement.note ?? undefined
      }))
    };
  };
  const invoicesView = (): LedgerSectionView => {
    const label = t("wallet.invoicesLabel");
    if (invoicesAnswer === undefined) return {
      phase: "resting",
      label
    };
    if (!invoicesAnswer.ok) return {
      phase: "refused",
      label,
      note: t("refusal.unknown")
    };
    if (invoicesAnswer.data.length === 0) return {
      phase: "empty",
      label,
      note: t("wallet.invoicesEmpty")
    };
    const rows = invoicesAnswer.data.filter(invoice => waypoint?.invoiceId === undefined || invoice.id !== waypoint.invoiceId).map(invoiceRow);
    let actionLabel: string | undefined;
    if (waypoint === undefined && invoicesAnswer.data.some(row => row.status === "unpaid")) {
      actionLabel = payingInvoice ? t("wallet.paying") : t("wallet.pay");
    }
    return {
      phase: "answered",
      label,
      actionLabel,
      rows
    };
  };
  const linkedInvoiceView = (currentWaypoint: WalletWaypoint | null): LinkedInvoiceSectionView => {
    const label = t("wallet.linkedInvoiceLabel");
    if (currentWaypoint === null) return {
      phase: "refused",
      label,
      note: t("wallet.invalidContinuation")
    };
    if (invoicesAnswer === undefined || walletAnswer === undefined) return {
      phase: "resting",
      label,
      orderLabel: t("wallet.orderLabel", {
        orderId: currentWaypoint.orderId
      })
    };
    if (!invoicesAnswer.ok || !walletAnswer.ok) return {
      phase: "refused",
      label,
      note: t("refusal.unknown")
    };
    const invoice = invoicesAnswer.data.find(row => row.id === currentWaypoint.invoiceId && row.catalogOrder?.id === currentWaypoint.orderId);
    if (invoice === undefined) return {
      phase: "refused",
      label,
      note: t("wallet.linkedInvoiceMissing")
    };
    const insufficient = invoice.status === "unpaid" && walletAnswer.data.balanceVnd < invoice.amountVnd;
    let actionLabel = t("wallet.payLinkedInvoice");
    if (invoice.status === "paid") actionLabel = t("wallet.returnToOrder");else if (payingInvoice) actionLabel = t("wallet.paying");
    let consequence = t("wallet.linkedInvoiceConsequence");
    if (insufficient) consequence = t("wallet.insufficientBalance");else if (invoice.status === "paid") consequence = t("wallet.paidContinuation");
    return {
      phase: "answered",
      label,
      orderLabel: t("wallet.orderLabel", {
        orderId: currentWaypoint.orderId
      }),
      row: invoiceRow(invoice),
      actionLabel,
      actionKind: invoice.status === "paid" ? "return" : "pay",
      actionDisabled: payingInvoice || insufficient,
      consequence
    };
  };
  const payInvoice = async () => {
    if (payingInvoice || invoicesAnswer?.ok !== true) return;
    const invoice = waypoint === null ? undefined : invoicesAnswer.data.find(row => row.status === "unpaid" && (waypoint === undefined || row.id === waypoint.invoiceId && row.catalogOrder?.id === waypoint.orderId));
    if (invoice === undefined) return;
    setPayingInvoice(true);
    setPaymentError(null);
    const paid = await payInvoiceMutation.trigger(invoice.id);
    if (!paid.ok) setPaymentError(paid.reason);else {
      await refresh();
      if (waypoint !== undefined && waypoint !== null) window.location.assign(waypoint.returnTo);
    }
    setPayingInvoice(false);
  };
  const submitTopUp = async () => {
    const amountVnd = Number(topUpAmount.replace(/\D/g, ""));
    if (!Number.isSafeInteger(amountVnd) || amountVnd < 10_000) {
      setTopUpError(t("wallet.topUpInvalid"));
      return;
    }
    if (walletAnswer?.ok !== true) {
      setTopUpError(t("wallet.topUpUnavailable"));
      return;
    }
    setTopUpPending(true);
    setTopUpError(undefined);
    const origin = window.location.origin;
    const returnUrl = `${origin}${route("/wallet/top-up/return")}`;
    const answer = await topUpMutation.trigger({
      amountVnd,
      returnUrl,
      cancelUrl: `${returnUrl}?status=cancelled`
    });
    if (!answer.ok) {
      setTopUpError(answer.reason);
      setTopUpPending(false);
      return;
    }
    setCheckout(answer.data);
    sessionStorage.setItem(TOP_UP_SESSION_KEY, JSON.stringify({
      amountVnd,
      startingBalanceVnd: walletAnswer.data.balanceVnd,
      referenceId: answer.data.referenceId
    }));
    const form = document.createElement("form");
    form.method = "POST";
    form.action = answer.data.checkoutUrl;
    try {
      const fields = answer.data.checkoutFields === null ? {} : JSON.parse(answer.data.checkoutFields) as Record<string, string>;
      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.append(input);
      });
    } catch {
      setTopUpError(t("wallet.checkoutInvalid"));
      setTopUpPending(false);
      return;
    }
    document.body.append(form);
    form.submit();
  };
  const stored = typeof window === "undefined" ? null : readTopUpSession();
  const isReturn = pathname.endsWith("/wallet/top-up/return");
  const isCancelled = searchParams.get("status") === "cancelled";
  const confirmed = stored !== null && walletAnswer?.ok === true && walletAnswer.data.balanceVnd >= stored.startingBalanceVnd + stored.amountVnd;
  const resultCopy = paymentResultCopy(isCancelled, confirmed, {
    cancelled: t("wallet.resultCancelled"),
    confirmed: t("wallet.resultConfirmed"),
    pending: t("wallet.resultPending"),
    cancelledNote: t("wallet.resultCancelledNote"),
    confirmedNote: t("wallet.resultConfirmedNote"),
    pendingNote: t("wallet.resultPendingNote")
  });
  const resultView: PaymentResultView = {
    overlayState: isReturn ? "open" : "closed",
    title: t("wallet.resultTitle"),
    closeLabel: t("wallet.close"),
    state: resultCopy.state,
    tone: resultCopy.tone,
    amount: stored === null ? t("wallet.amountUnknown") : amount(stored.amountVnd),
    reference: stored?.referenceId,
    note: resultCopy.note,
    actionLabel: t("wallet.backToWallet")
  };
  const topUpView: TopUpView = {
    overlayState: topUpOpen ? "open" : "closed",
    title: t("wallet.topUpTitle"),
    closeLabel: t("wallet.close"),
    amountLabel: t("wallet.amountLabel"),
    amountPlaceholder: t("wallet.amountPlaceholder"),
    hint: t("wallet.topUpHint"),
    submitLabel: t("wallet.continueSePay"),
    amount: topUpAmount,
    pending: topUpPending,
    refusal: topUpError,
    checkout: checkout === undefined ? undefined : {
      reference: t("wallet.reference", {
        reference: checkout.referenceId
      }),
      amount: amount(checkout.chargedAmountVnd),
      note: t("wallet.redirecting")
    }
  };
  const pageProps = {
    title: t("wallet.title"),
    balance: balanceView(),
    transactions: transactionsView(),
    invoices: invoicesView(),
    topUp: topUpView,
    result: resultView,
    on: {
      topUp: () => setTopUpOpen(true),
      closeTopUp: () => setTopUpOpen(false),
      changeTopUpAmount: setTopUpAmount,
      submitTopUp: () => void submitTopUp(),
      closeResult: () => {
        sessionStorage.removeItem(TOP_UP_SESSION_KEY);
        window.location.assign(route("/wallet"));
      },
      payInvoice: () => void payInvoice(),
      openOrder: waypoint === undefined || waypoint === null ? undefined : () => window.location.assign(waypoint.returnTo),
      returnToOrder: waypoint === undefined || waypoint === null ? undefined : () => window.location.assign(waypoint.returnTo)
    }
  };
  if (pageState === "ordinary" || waypoint === undefined) return <WalletControlCenterBase state="ordinary" {...pageProps} />;
  const breadcrumb = waypoint === null ? undefined : {
    label: t("wallet.pathLabel"),
    backLabel: t("wallet.returnToOrder")
  };
  return <WalletControlCenterBase state="waypoint" breadcrumb={breadcrumb} linkedInvoice={linkedInvoiceView(waypoint)} {...pageProps} />;
};
