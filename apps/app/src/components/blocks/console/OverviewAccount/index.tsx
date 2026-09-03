"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useOverviewData } from "@/modules/overview/context";
import { BILLING_CURRENCY } from "@/modules/config";
import { OverviewAccountBase, type OverviewAccountFact, type OverviewAccountInvoiceRow } from "./component";
/** Public API role for OverviewAccountProps. */
export type OverviewAccountProps = {
  readonly label: string;
};
export type { OverviewAccountFact, OverviewAccountInvoiceRow } from "./component";
/** Whether a due date already lies behind the current instant. */
const isPast = (dueAt: string): boolean => new Date(dueAt).getTime() < Date.now();
const SKELETON_FACTS: ReadonlyArray<OverviewAccountFact> = [
  { id: "pending-balance", label: "", value: "", isSkeleton: true },
  { id: "pending-unpaid", label: "", value: "", isSkeleton: true }
];
const SKELETON_INVOICE_ROW: OverviewAccountInvoiceRow = {
  name: "",
  detail: "",
  statusLabel: "",
  badgeTone: "neutral",
  actionLabel: "",
  onTopUp: () => undefined,
  isSkeleton: true
};

/** Connect exact balance and invoice evidence to the account surface, with the next step it owes. */
export const OverviewAccount = (props: OverviewAccountProps) => {
  const { label } = props;
  const { wallet, invoices } = useOverviewData();
  const t = useTranslations("console");
  const format = useFormatter();
  const router = useRouter();
  const open = (route: string) => router.push(route);
  const money = (value: number) => format.number(value, {
    style: "currency",
    currency: BILLING_CURRENCY,
    maximumFractionDigits: 0
  });
  const day = (value: string) => format.dateTime(new Date(value), {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  if (wallet === null || invoices === null) return <OverviewAccountBase
    label={label}
    facts={SKELETON_FACTS}
    invoiceRow={SKELETON_INVOICE_ROW}
  />;
  const onOpenWallet = () => open("/wallet");
  if (!wallet.ok) return <OverviewAccountBase
    label={label}
    state="unavailable"
    facts={[]}
  />;
  const unpaidCount = invoices.ok ? invoices.data.filter(invoice => invoice.status === "unpaid").length : 0;
  const totalCount = invoices.ok ? invoices.data.length : 0;
  const facts: ReadonlyArray<OverviewAccountFact> = [
    { id: "balance", label: t("overview.account.walletBalance"), value: money(wallet.data.balanceVnd) },
    { id: "unpaid", label: t("overview.account.unpaidInvoices"), value: invoices.ok ? t("overview.account.unpaidCount", {
      unpaid: unpaidCount,
      total: totalCount
    }) : t("refusal.unknown") }
  ];
  const unpaid = invoices.ok ? invoices.data.find(invoice => invoice.status === "unpaid") : undefined;
  const isOverdue = unpaid !== undefined && isPast(unpaid.dueAt);
  const invoiceRow: OverviewAccountInvoiceRow | undefined = unpaid === undefined ? undefined : {
    name: t("overview.account.invoiceName", {
      id: unpaid.id.slice(0, 8).toUpperCase()
    }),
    detail: t("overview.account.invoiceDetailUnpaid", {
      date: day(unpaid.dueAt)
    }),
    statusLabel: isOverdue ? t("overview.account.overdue") : t("overview.account.dueSoon"),
    badgeTone: isOverdue ? "danger" : "warning",
    actionLabel: t("overview.account.topUpWallet"),
    onTopUp: () => open("/wallet/top-up")
  };
  return <OverviewAccountBase
    label={label}
    actionLabel={t("wallet.viewTransactions")}
    onOpenWallet={onOpenWallet}
    isHighlight={invoiceRow !== undefined}
    state={invoices.ok ? undefined : "cautionary"}
    facts={facts}
    invoiceRow={invoiceRow}
  />;
};

/** Registry identity for the connected overview account twin. */
