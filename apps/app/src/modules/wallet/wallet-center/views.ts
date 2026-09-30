import type { InvoiceFieldsFragment, WalletFieldsFragment, WalletTransactionFieldsFragment } from "@/modules/api/__generated__/core"

import type { useTranslations } from "next-intl"

import { type Outcome } from "@nivo/api"
import type { NivoQueryFailure } from "@/modules/query"
import type { BalanceSectionView, LedgerSectionView, LinkedInvoiceSectionView, WalletFactRow, WalletLedgerRow } from "./types"
import { invoiceTone, type WalletWaypoint } from "./waypoint"

type WalletTranslator = ReturnType<typeof useTranslations<"console">>

const queryFailure = <T,>(failure: Extract<Outcome<T>, { readonly ok: false }>): NivoQueryFailure => ({
    kind: failure.kind,
    responseStatus: failure.status,
    code: failure.code,
    reason: failure.reason,
    retryable: failure.retryable,
})

type WalletSectionInput = {
    readonly walletAnswer: Outcome<WalletFieldsFragment> | undefined
    readonly invoicesAnswer: Outcome<ReadonlyArray<InvoiceFieldsFragment>> | undefined
    readonly movements: Outcome<ReadonlyArray<WalletTransactionFieldsFragment>> | undefined
    readonly waypoint: WalletWaypoint | null | undefined
    readonly payingInvoice: boolean
    readonly paymentError: string | null
    readonly t: WalletTranslator
    readonly amount: (amountVnd: number) => string
    readonly day: (iso: string) => string

}

/** Project wallet, transaction and invoice answers into settled section states. */
export const createWalletSectionViews = (input: WalletSectionInput) => {
    const { walletAnswer, invoicesAnswer, movements, waypoint, payingInvoice, paymentError, t, amount, day } = input
    const invoiceLabel = (invoice: InvoiceFieldsFragment) => {
        const item = invoice.catalogOrder?.catalogItem?.name
        const tier = invoice.catalogOrder?.catalogTier?.name
        if (item === undefined) return t("wallet.invoicesLabel")
        return tier === undefined ? item : `${item} · ${tier}`
    }
    const invoiceRow = (invoice: InvoiceFieldsFragment): WalletLedgerRow => ({
        id: invoice.id,
        title: invoiceLabel(invoice),
        caption: t("wallet.dueAt", {
            date: day(invoice.dueAt),
        }),
        amount: amount(invoice.amountVnd),
        state: t(`wallet.status.${invoice.status}`),
        tone: invoiceTone(invoice.status),
        detailLabel: t("wallet.viewDetail"),
        detailFacts: [
            {
                id: "amount",
                label: t("wallet.amountLabel"),
                value: amount(invoice.amountVnd),
            },
            {
                id: "due",
                label: t("wallet.dueDateLabel"),
                value: day(invoice.dueAt),
            },
            {
                id: "status",
                label: t("wallet.statusLabel"),
                value: t(`wallet.status.${invoice.status}`),
            },
        ],
        note: invoice.status === "unpaid" && paymentError !== null ? paymentError : undefined,
    })
    const balanceView = (): BalanceSectionView => {
        const label = t("wallet.availableBalance")
        if (walletAnswer === undefined)
            return {
                phase: "resting",
                label,
                actionLabel: t("wallet.topUp"),
            }
        if (!walletAnswer.ok)
            return {
                phase: "failed",
                label,
                failure: queryFailure(walletAnswer),
            }
        const facts: Array<WalletFactRow> = [
            {
                id: "balance",
                label: t("wallet.balanceLabel"),
                value: amount(walletAnswer.data.balanceVnd),
            },
        ]
        if (invoicesAnswer?.ok === true) {
            const unpaid = invoicesAnswer.data.find((invoice) => invoice.status === "unpaid")
            facts.push({
                id: "unpaid",
                label: t("wallet.unpaidLabel"),
                value: unpaid === undefined ? t("wallet.noUnpaid") : amount(unpaid.amountVnd),
            })
        }
        return {
            phase: walletAnswer.data.balanceVnd === 0 ? "empty" : "answered",
            label,
            actionLabel: t("wallet.topUp"),
            facts,
        }
    }
    const transactionsView = (): LedgerSectionView => {
        const label = t("wallet.transactionsLabel")
        if (movements === undefined)
            return {
                phase: "resting",
                label,
            }
        if (!movements.ok)
            return {
                phase: "failed",
                label,
                failure: queryFailure(movements),
                source: "transactions",
            }
        if (movements.data.length === 0)
            return {
                phase: "empty",
                label,
                note: t("wallet.transactionsEmpty"),
            }
        return {
            phase: "answered",
            label,
            rows: movements.data.map((movement) => ({
                id: movement.id,
                title: t(`wallet.type.${movement.type}`),
                caption: day(movement.createdAt),
                amount: amount(movement.amountVnd),
                state: t(`wallet.type.${movement.type}`),
                tone: movement.type === "deposit" ? "success" : "neutral",
                detailLabel: t("wallet.viewDetail"),
                detailFacts: [
                    {
                        id: "amount",
                        label: t("wallet.amountLabel"),
                        value: amount(movement.amountVnd),
                    },
                    {
                        id: "date",
                        label: t("wallet.dateLabel"),
                        value: day(movement.createdAt),
                    },
                    {
                        id: "type",
                        label: t("wallet.typeLabel"),
                        value: t(`wallet.type.${movement.type}`),
                    },
                ],
                note: movement.note ?? undefined,
            })),
        }
    }
    const invoicesView = (): LedgerSectionView => {
        const label = t("wallet.invoicesLabel")
        if (invoicesAnswer === undefined)
            return {
                phase: "resting",
                label,
            }
        if (!invoicesAnswer.ok)
            return {
                phase: "failed",
                label,
                failure: queryFailure(invoicesAnswer),
                source: "invoices",
            }
        if (invoicesAnswer.data.length === 0)
            return {
                phase: "empty",
                label,
                note: t("wallet.invoicesEmpty"),
            }
        const rows = invoicesAnswer.data
            .filter((invoice) => waypoint?.invoiceId === undefined || invoice.id !== waypoint.invoiceId)
            .map(invoiceRow)
        let actionLabel: string | undefined
        if (waypoint === undefined && invoicesAnswer.data.some((row) => row.status === "unpaid")) {
            actionLabel = payingInvoice ? t("wallet.paying") : t("wallet.pay")
        }
        return {
            phase: "answered",
            label,
            actionLabel,
            rows,
        }
    }
    const linkedInvoiceView = (currentWaypoint: WalletWaypoint | null): LinkedInvoiceSectionView => {
        const label = t("wallet.linkedInvoiceLabel")
        if (currentWaypoint === null)
            return {
                phase: "refused",
                label,
                note: t("wallet.invalidContinuation"),
            }
        if (invoicesAnswer === undefined || walletAnswer === undefined)
            return {
                phase: "resting",
                label,
                orderLabel: t("wallet.orderLabel", {
                    orderId: currentWaypoint.orderId,
                }),
            }
        if (!invoicesAnswer.ok)
            return {
                phase: "failed",
                label,
                orderLabel: t("wallet.orderLabel", { orderId: currentWaypoint.orderId }),
                failure: queryFailure(invoicesAnswer),
                source: "invoices",
            }
        if (!walletAnswer.ok)
            return {
                phase: "failed",
                label,
                orderLabel: t("wallet.orderLabel", { orderId: currentWaypoint.orderId }),
                failure: queryFailure(walletAnswer),
                source: "wallet",
            }
        const invoice = invoicesAnswer.data.find(
            (row) => row.id === currentWaypoint.invoiceId && row.catalogOrder?.id === currentWaypoint.orderId,
        )
        if (invoice === undefined)
            return {
                phase: "refused",
                label,
                note: t("wallet.linkedInvoiceMissing"),
            }
        const insufficient = invoice.status === "unpaid" && walletAnswer.data.balanceVnd < invoice.amountVnd
        let actionLabel = t("wallet.payLinkedInvoice")
        if (invoice.status === "paid") actionLabel = t("wallet.returnToOrder")
        else if (payingInvoice) actionLabel = t("wallet.paying")
        let consequence = t("wallet.linkedInvoiceConsequence")
        if (insufficient) consequence = t("wallet.insufficientBalance")
        else if (invoice.status === "paid") consequence = t("wallet.paidContinuation")
        return {
            phase: "answered",
            label,
            orderLabel: t("wallet.orderLabel", {
                orderId: currentWaypoint.orderId,
            }),
            row: invoiceRow(invoice),
            actionLabel,
            actionKind: invoice.status === "paid" ? "return" : "pay",
            actionDisabled: payingInvoice || insufficient,
            consequence,
        }
    }
    return {
        balance: balanceView(),
        transactions: transactionsView(),
        invoices: invoicesView(),
        linkedInvoice: waypoint === undefined ? undefined : linkedInvoiceView(waypoint),
        invoiceRow,
    }
}
