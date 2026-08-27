"use client"

import { useFormatter, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useOverviewData } from "@/modules/overview/context"
import { WalletSummaryBase, type WalletSummaryFact, type WalletSummaryState } from "./component"

export type { WalletSummaryFact, WalletSummaryProps, WalletSummaryState } from "./component"

/** Connect exact balance and newest unpaid invoice to the wallet surface. */
export const WalletSummary = () => {
    const { wallet, invoices } = useOverviewData()
    const t = useTranslations("console")
    const format = useFormatter()
    const router = useRouter()
    const open = (route: string) => router.push(route)
    const refusal = () => t("refusal.unknown")
    const money = (value: number) => format.number(value, { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    const day = (value: string) => format.dateTime(new Date(value), { day: "2-digit", month: "short", year: "numeric" })
    let state: WalletSummaryState
    if (wallet === null || invoices === null) state = { phase: "pending" }
    else if (!wallet.ok) state = { phase: "failed", note: refusal() }
    else {
        const facts: Array<WalletSummaryFact> = [{ id: "balance", label: t("wallet.availableBalance"), value: money(wallet.data.balanceVnd), emphasis: true }]
        if (invoices.ok) {
            const unpaid = invoices.data.find((invoice) => invoice.status === "unpaid")
            if (unpaid !== undefined) facts.push({ id: unpaid.id, label: `#${unpaid.id.slice(0, 8).toUpperCase()}`, value: `${money(unpaid.amountVnd)} · ${t("wallet.dueAt", { date: day(unpaid.dueAt) })}`, emphasis: false })
        }
        if (!invoices.ok) state = { phase: "partial", facts, note: refusal() }
        else state = wallet.data.balanceVnd === 0 && invoices.data.every((invoice) => invoice.status !== "unpaid") ? { phase: "empty", facts } : { phase: "populated", facts }
    }
    return <WalletSummaryBase
        label={t("wallet.title")}
        actionLabel={t("wallet.viewTransactions")}
        secondaryActionLabel={t("wallet.topUp")}
        state={state}
        onOpenWallet={() => open("/wallet")}
        onTopUp={() => open("/wallet/top-up")}
    />
}

/** Registry identity for the connected wallet summary twin. */
export const meta = { shape: "block", world: "connected" } as const
