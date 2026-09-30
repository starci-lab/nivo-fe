"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useNow } from "@/hooks/time"
import { useOverviewData } from "@/hooks/overview"
import { useRouter } from "@/hooks/i18n"
import { useQueryMyInvoicesSwr, useQueryMyWalletSwr } from "@/hooks/swr"
import { BILLING_CURRENCY } from "@/modules/config"
import { useQueryNoticeData } from "@/hooks/query"
import type { NivoQueryFailure } from "@/modules/query"
import type { Outcome } from "@nivo/api"
import { OverviewAccountBase, type OverviewAccountFact, type OverviewAccountInvoiceRow } from "./component"
/** Public API role for OverviewAccountProps. */
export type OverviewAccountProps = {
    readonly label: string
}
export type { OverviewAccountFact, OverviewAccountInvoiceRow } from "./component"
/** Whether a due date already lies behind the given instant; an instant not yet known is never past. */
const isPast = (dueAt: string, now: number | null): boolean => now !== null && new Date(dueAt).getTime() < now
const SKELETON_FACTS: ReadonlyArray<OverviewAccountFact> = [
    { id: "pending-balance", label: "", value: "", isSkeleton: true },
    { id: "pending-unpaid", label: "", value: "", isSkeleton: true },
]
const SKELETON_INVOICE_ROW: OverviewAccountInvoiceRow = {
    name: "",
    detail: "",
    statusLabel: "",
    badgeTone: "neutral",
    actionLabel: "",
    isSkeleton: true,
}

type AccountReading<T> =
    | { readonly status: "resting" }
    | { readonly status: "ready"; readonly data: T }
    | { readonly status: "failed"; readonly failure: NivoQueryFailure }

const accountReading = <T,>(answer: Outcome<T> | null): AccountReading<T> => {
    if (answer === null) return { status: "resting" }
    switch (answer.ok) {
        case true:
            return { status: "ready", data: answer.data }
        case false:
            return { status: "failed", failure: answer }
    }
}

/** Connect exact balance and invoice evidence to the account surface, with the next step it owes. */
export const OverviewAccount = (props: OverviewAccountProps) => {
    const { label } = props
    const { wallet, invoices } = useOverviewData()
    const walletQuery = useQueryMyWalletSwr()
    const invoicesQuery = useQueryMyInvoicesSwr()
    const now = useNow()
    const t = useTranslations("console")
    const format = useFormatter()
    const router = useRouter()
    const noticeOf = useQueryNoticeData()
    const open = (route: string) => router.push(route)
    const money = (value: number) =>
        format.number(value, {
            style: "currency",
            currency: BILLING_CURRENCY,
            maximumFractionDigits: 0,
        })
    const day = (value: string) =>
        format.dateTime(new Date(value), {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    const walletReading = accountReading(wallet)
    const invoicesReading = accountReading(invoices)
    if (walletReading.status === "resting" || invoicesReading.status === "resting")
        return <OverviewAccountBase props={{ label, facts: SKELETON_FACTS, invoiceRow: SKELETON_INVOICE_ROW }} />
    const retryReads = () => {
        void walletQuery.mutate()
        void invoicesQuery.mutate()
    }
    const showFailure = (
        failure: NivoQueryFailure,
        facts: ReadonlyArray<OverviewAccountFact>,
        failureFactId: string,
    ) => {
        const notice = noticeOf(failure)
        const signIn = notice.signIn
        const action = signIn === undefined ? retryReads : () => router.push(signIn.href)
        return (
            <OverviewAccountBase
                state="unavailable"
                props={{
                    label,
                    facts: facts.map((fact) =>
                        fact.id === failureFactId ? { ...fact, value: notice.message } : fact,
                    ),
                    actionLabel: notice.signIn?.label ?? notice.retryLabel,
                }}
                on={{ openWallet: action }}
            />
        )
    }
    if (walletReading.status === "failed")
        return showFailure(walletReading.failure, [
            { id: "wallet-failure", label: t("overview.account.walletBalance"), value: "" },
        ], "wallet-failure")
    if (invoicesReading.status === "failed")
        return showFailure(invoicesReading.failure, [
            { id: "balance", label: t("overview.account.walletBalance"), value: money(walletReading.data.balanceVnd) },
            { id: "invoice-failure", label: t("overview.account.unpaidInvoices"), value: "" },
        ], "invoice-failure")
    const walletData = walletReading.data
    const invoiceData = invoicesReading.data
    const onOpenWallet = () => open("/wallet")
    const unpaidCount = invoiceData.filter((invoice) => invoice.status === "unpaid").length
    const totalCount = invoiceData.length
    const facts: ReadonlyArray<OverviewAccountFact> = [
        { id: "balance", label: t("overview.account.walletBalance"), value: money(walletData.balanceVnd) },
        {
            id: "unpaid",
            label: t("overview.account.unpaidInvoices"),
            value: t("overview.account.unpaidCount", {
                unpaid: unpaidCount,
                total: totalCount,
            }),
        },
    ]
    const unpaid = invoiceData.find((invoice) => invoice.status === "unpaid")
    const isOverdue = unpaid !== undefined && isPast(unpaid.dueAt, now)
    const invoiceRow: OverviewAccountInvoiceRow | undefined =
        unpaid === undefined
            ? undefined
            : {
                  name: t("overview.account.invoiceName", {
                      id: unpaid.id.slice(0, 8).toUpperCase(),
                  }),
                  detail: t("overview.account.invoiceDetailUnpaid", {
                      date: day(unpaid.dueAt),
                  }),
                  statusLabel: isOverdue ? t("overview.account.overdue") : t("overview.account.dueSoon"),
                  badgeTone: isOverdue ? "danger" : "warning",
                  actionLabel: t("overview.account.topUpWallet"),
              }
    return (
        <OverviewAccountBase
            props={{
                label,
                actionLabel: t("wallet.viewTransactions"),
                isHighlight: invoiceRow !== undefined,
                facts,
                invoiceRow,
            }}
            on={{ openWallet: onOpenWallet, topUp: () => open("/wallet/top-up") }}
        />
    )
}

/** Registry identity for the connected overview account twin. */
