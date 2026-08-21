"use client"

import { useCallback, useEffect, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { useSession } from "@/modules/auth/session"
import {
    createWalletTopUpPayLink,
    myInvoices,
    myWallet,
    myWalletTransactions,
    payInvoice as payInvoiceMutation,
    type InvoiceRow,
    type WalletRow,
    type WalletTopUpPayLink,
    type WalletTransactionRow,
} from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import {
    WalletPageBase as WalletPageView,
    type BalanceSectionView,
    type LedgerSectionView,
    type PaymentResultView,
    type TopUpView,
    type WalletFactRow,
} from "./component"

type MoneyAnswer = { readonly wallet: Result<WalletRow>, readonly invoices: Result<ReadonlyArray<InvoiceRow>> }
type TopUpSession = { readonly amountVnd: number, readonly startingBalanceVnd: number, readonly referenceId: string }
const TOP_UP_SESSION_KEY = "nivo.wallet.top-up"

const readTopUpSession = (): TopUpSession | null => {
    try {
        const raw = sessionStorage.getItem(TOP_UP_SESSION_KEY)
        return raw === null ? null : JSON.parse(raw) as TopUpSession
    } catch { return null }
}

/** Connected wallet: reads ledgers, creates a real SePay checkout, and reconciles the return honestly. */
export const WalletPage = () => {
    const t = useTranslations("console")
    const format = useFormatter()
    const pathname = typeof window === "undefined" ? "/en/wallet" : window.location.pathname
    const session = useSession()
    const isSignedIn = session.state.status === "signed-in"
    const [money, setMoney] = useState<MoneyAnswer | null>(null)
    const [movements, setMovements] = useState<Result<ReadonlyArray<WalletTransactionRow>> | null>(null)
    const [payingInvoice, setPayingInvoice] = useState(false)
    const [paymentError, setPaymentError] = useState<string | null>(null)
    const [topUpOpen, setTopUpOpen] = useState(pathname.endsWith("/wallet/top-up"))
    const [topUpAmount, setTopUpAmount] = useState("")
    const [topUpPending, setTopUpPending] = useState(false)
    const [topUpError, setTopUpError] = useState<string | undefined>()
    const [checkout, setCheckout] = useState<WalletTopUpPayLink | undefined>()

    const refresh = useCallback(async () => {
        const [wallet, invoices, transactions] = await Promise.all([myWallet(), myInvoices(), myWalletTransactions()])
        setMoney({ wallet, invoices })
        setMovements(transactions)
    }, [])

    useEffect(() => { if (isSignedIn) void refresh() }, [isSignedIn, refresh])

    const amount = (amountVnd: number) => format.number(amountVnd, { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    const day = (iso: string) => format.dateTime(new Date(iso), { day: "2-digit", month: "2-digit", year: "numeric" })
    const invoiceLabel = (invoice: InvoiceRow) => {
        const item = invoice.catalogOrder?.catalogItem?.name
        const tier = invoice.catalogOrder?.catalogTier?.name
        if (item === undefined) return t("wallet.invoicesLabel")
        return tier === undefined ? item : `${item} · ${tier}`
    }

    const balanceView = (): BalanceSectionView => {
        const label = t("wallet.balanceLabel")
        if (money === null) return { phase: "resting", label, actionLabel: t("wallet.topUp") }
        if (!money.wallet.ok) return { phase: "refused", label, note: t("refusal.unknown") }
        const facts: Array<WalletFactRow> = [{ id: "balance", label: t("wallet.availableBalance"), value: amount(money.wallet.data.balanceVnd) }]
        if (money.invoices.ok) {
            const unpaid = money.invoices.data.find((invoice) => invoice.status === "unpaid")
            facts.push({ id: "unpaid", label: t("wallet.unpaidLabel"), value: unpaid === undefined ? t("wallet.noUnpaid") : amount(unpaid.amountVnd) })
        }
        return { phase: money.wallet.data.balanceVnd === 0 ? "empty" : "answered", label, actionLabel: t("wallet.topUp"), facts }
    }

    const transactionsView = (): LedgerSectionView => {
        const label = t("wallet.transactionsLabel")
        if (movements === null) return { phase: "resting", label }
        if (!movements.ok) return { phase: "refused", label, note: t("refusal.unknown") }
        if (movements.data.length === 0) return { phase: "empty", label, note: t("wallet.transactionsEmpty") }
        return { phase: "answered", label, rows: movements.data.map((movement) => ({
            id: movement.id,
            title: t(`wallet.type.${movement.type}`),
            caption: day(movement.createdAt),
            amount: amount(movement.amountVnd),
            state: t(`wallet.type.${movement.type}`),
            tone: movement.type === "deposit" ? "success" : "neutral",
            detailLabel: t("wallet.viewDetail"),
            detailFacts: [
                { id: "amount", label: t("wallet.amountLabel"), value: amount(movement.amountVnd) },
                { id: "date", label: t("wallet.dateLabel"), value: day(movement.createdAt) },
                { id: "type", label: t("wallet.typeLabel"), value: t(`wallet.type.${movement.type}`) },
            ],
            note: movement.note ?? undefined,
        })) }
    }

    const invoicesView = (): LedgerSectionView => {
        const label = t("wallet.invoicesLabel")
        if (money === null) return { phase: "resting", label }
        if (!money.invoices.ok) return { phase: "refused", label, note: t("refusal.unknown") }
        if (money.invoices.data.length === 0) return { phase: "empty", label, note: t("wallet.invoicesEmpty") }
        return { phase: "answered", label, actionLabel: money.invoices.data.some((row) => row.status === "unpaid") ? (payingInvoice ? t("wallet.paying") : t("wallet.pay")) : undefined, rows: money.invoices.data.map((invoice) => ({
            id: invoice.id,
            title: invoiceLabel(invoice),
            caption: t("wallet.dueAt", { date: day(invoice.dueAt) }),
            amount: amount(invoice.amountVnd),
            state: t(`wallet.status.${invoice.status}`),
            tone: invoice.status === "paid" ? "success" : invoice.status === "unpaid" ? "warning" : "neutral",
            detailLabel: t("wallet.viewDetail"),
            detailFacts: [
                { id: "amount", label: t("wallet.amountLabel"), value: amount(invoice.amountVnd) },
                { id: "due", label: t("wallet.dueDateLabel"), value: day(invoice.dueAt) },
                { id: "status", label: t("wallet.statusLabel"), value: t(`wallet.status.${invoice.status}`) },
            ],
            note: invoice.status === "unpaid" && paymentError !== null ? paymentError : undefined,
        })) }
    }

    const payInvoice = async () => {
        if (payingInvoice || money?.invoices.ok !== true) return
        const invoice = money.invoices.data.find((row) => row.status === "unpaid")
        if (invoice === undefined) return
        setPayingInvoice(true)
        setPaymentError(null)
        const paid = await payInvoiceMutation(invoice.id)
        if (!paid.ok) setPaymentError(paid.reason)
        else await refresh()
        setPayingInvoice(false)
    }

    const submitTopUp = async () => {
        const amountVnd = Number(topUpAmount.replace(/[^0-9]/g, ""))
        if (!Number.isSafeInteger(amountVnd) || amountVnd < 10_000) { setTopUpError(t("wallet.topUpInvalid")); return }
        if (money?.wallet.ok !== true) { setTopUpError(t("wallet.topUpUnavailable")); return }
        setTopUpPending(true)
        setTopUpError(undefined)
        const locale = pathname.split("/")[1] || "en"
        const origin = window.location.origin
        const returnUrl = `${origin}/${locale}/wallet/top-up/return`
        const answer = await createWalletTopUpPayLink(amountVnd, returnUrl, `${returnUrl}?status=cancelled`)
        if (!answer.ok) { setTopUpError(answer.reason); setTopUpPending(false); return }
        setCheckout(answer.data)
        sessionStorage.setItem(TOP_UP_SESSION_KEY, JSON.stringify({ amountVnd, startingBalanceVnd: money.wallet.data.balanceVnd, referenceId: answer.data.referenceId }))
        const form = document.createElement("form")
        form.method = "POST"
        form.action = answer.data.checkoutUrl
        try {
            const fields = answer.data.checkoutFields === null ? {} : JSON.parse(answer.data.checkoutFields) as Record<string, string>
            Object.entries(fields).forEach(([name, value]) => {
                const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; form.append(input)
            })
        } catch { setTopUpError(t("wallet.checkoutInvalid")); setTopUpPending(false); return }
        document.body.append(form)
        form.submit()
    }

    const stored = typeof window === "undefined" ? null : readTopUpSession()
    const isReturn = pathname.endsWith("/wallet/top-up/return")
    const isCancelled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("status") === "cancelled"
    const confirmed = stored !== null && money?.wallet.ok === true && money.wallet.data.balanceVnd >= stored.startingBalanceVnd + stored.amountVnd
    const resultView: PaymentResultView = {
        open: isReturn,
        title: t("wallet.resultTitle"),
        closeLabel: t("wallet.close"),
        state: isCancelled ? t("wallet.resultCancelled") : confirmed ? t("wallet.resultConfirmed") : t("wallet.resultPending"),
        tone: isCancelled ? "neutral" : confirmed ? "success" : "warning",
        amount: stored === null ? t("wallet.amountUnknown") : amount(stored.amountVnd),
        reference: stored?.referenceId,
        note: isCancelled ? t("wallet.resultCancelledNote") : confirmed ? t("wallet.resultConfirmedNote") : t("wallet.resultPendingNote"),
        actionLabel: t("wallet.backToWallet"),
    }
    const topUpView: TopUpView = {
        open: topUpOpen,
        title: t("wallet.topUpTitle"), closeLabel: t("wallet.close"), amountLabel: t("wallet.amountLabel"),
        amountPlaceholder: t("wallet.amountPlaceholder"), hint: t("wallet.topUpHint"), submitLabel: t("wallet.continueSePay"),
        amount: topUpAmount, pending: topUpPending, refusal: topUpError,
        checkout: checkout === undefined ? undefined : { reference: t("wallet.reference", { reference: checkout.referenceId }), amount: amount(checkout.chargedAmountVnd), note: t("wallet.redirecting") },
    }

    return <WalletPageView title={t("wallet.title")} balance={balanceView()} transactions={transactionsView()} invoices={invoicesView()} topUp={topUpView} result={resultView} on={{
        topUp: () => setTopUpOpen(true), closeTopUp: () => setTopUpOpen(false), changeTopUpAmount: setTopUpAmount,
        submitTopUp: () => void submitTopUp(), closeResult: () => { sessionStorage.removeItem(TOP_UP_SESSION_KEY); window.location.assign(`/${pathname.split("/")[1] || "en"}/wallet`) },
        payInvoice: () => void payInvoice(),
    }} />
}

/** Source-level tier marker for the connected page half. */
export const meta = { shape: "page", world: "connected" } as const
