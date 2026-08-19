"use client"

import { useEffect, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"
import { useSession } from "@/modules/auth/session"
import {
    myInvoices,
    myWallet,
    myWalletTransactions,
    payInvoice as payInvoiceMutation,
    type InvoiceRow,
    type WalletRow,
    type WalletTransactionRow,
} from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import {
    WalletPageBase as WalletPageView,
    type BalanceSectionView,
    type LedgerSectionView,
    type WalletFactRow,
} from "./component"

/**
 * PAGE (connected half) - the wallet asks the world, and settles a situation per section.
 *
 * TWO EFFECTS, SPLIT WHERE THE QUERIES ARE. The balance line and the invoices ledger both read
 * `myInvoices` - the balance for the one unpaid amount, the ledger for every row - so they settle
 * together rather than sending the same request twice. The movements are their own question and
 * answer at their own moment.
 *
 * NOTHING FIRES UNTIL THE SESSION IS SETTLED, for the reason `OverviewPage` records: a query sent
 * during the refresh round trip carries no credential and comes back `Authentication required`.
 *
 * WHERE THE FIGURES ARE RESOLVED. Here, because the schema hands over an Int and an ISO string and
 * `useFormatter` under the served locale and time zone is what turns them into a readable amount and
 * a readable date. `presentational-purity` refuses that call one file away, which is what makes this
 * the only place it can happen.
 */

/** What the balance and the invoices ledger both asked for. */
type MoneyAnswer = {
    readonly wallet: Result<WalletRow>
    readonly invoices: Result<ReadonlyArray<InvoiceRow>>
}

/**
 * The account's money.
 *
 * @returns The page node.
 */
export const WalletPage = () => {
    const t = useTranslations("console")
    const format = useFormatter()
    const session = useSession()
    const isSignedIn = session.state.status === "signed-in"
    const [money, setMoney] = useState<MoneyAnswer | null>(null)
    const [movements, setMovements] = useState<Result<ReadonlyArray<WalletTransactionRow>> | null>(null)
    const [payingInvoice, setPayingInvoice] = useState(false)
    const [paymentError, setPaymentError] = useState<string | null>(null)

    useEffect(() => {
        if (!isSignedIn) {
            return
        }
        let cancelled = false
        const ask = async () => {
            const [wallet, invoices] = await Promise.all([myWallet(), myInvoices()])
            if (!cancelled) {
                setMoney({ wallet, invoices })
            }
        }
        void ask()
        return () => {
            cancelled = true
        }
    }, [isSignedIn])

    useEffect(() => {
        if (!isSignedIn) {
            return
        }
        let cancelled = false
        const ask = async () => {
            const answer = await myWalletTransactions()
            if (!cancelled) {
                setMovements(answer)
            }
        }
        void ask()
        return () => {
            cancelled = true
        }
    }, [isSignedIn])

    const amount = (amountVnd: number) =>
        format.number(amountVnd, { style: "currency", currency: "VND", maximumFractionDigits: 0 })

    const day = (iso: string) => format.dateTime(new Date(iso), { day: "2-digit", month: "2-digit" })

    /**
     * What an invoice row is called.
     *
     * Written as three answers rather than one nested question: the relation is gone, the rung is
     * gone, or both are there. See the note in {@link invoicesView} for why either can be absent.
     *
     * @param item - The product name, when the order still points at a catalog item.
     * @param tier - The rung's name, when the order still points at a tier.
     */
    const invoiceLabel = (item?: string, tier?: string) => {
        if (item === undefined) {
            return t("wallet.invoicesLabel")
        }
        if (tier === undefined) {
            return item
        }
        return `${item} · ${tier}`
    }

    const balanceView = (): BalanceSectionView => {
        const label = t("wallet.balanceLabel")
        if (money === null) {
            return { phase: "resting", label, actionLabel: t("wallet.topUp") }
        }
        if (!money.wallet.ok) {
            return { phase: "refused", label, note: t("refusal.unknown") }
        }
        const balanceVnd = money.wallet.data.balanceVnd
        const facts: Array<WalletFactRow> = [
            { id: "balance", label: t("wallet.balanceLabel"), value: amount(balanceVnd) },
        ]
        /*
         * THE UNPAID LINE IS DRAWN ONLY WHEN THE INVOICES ANSWERED. A "none owed" written while that
         * query was refused would be a claim this screen cannot support, and the balance above it is
         * still correct.
         */
        if (money.invoices.ok) {
            const unpaid = money.invoices.data.find((invoice) => invoice.status === "unpaid")
            facts.push({
                id: "unpaid",
                label: t("wallet.unpaidLabel"),
                value: unpaid === undefined
                    ? t("wallet.noUnpaid")
                    : `${amount(unpaid.amountVnd)} · ${t("wallet.dueAt", { date: day(unpaid.dueAt) })}`,
            })
        }
        return balanceVnd === 0
            ? { phase: "empty", label, actionLabel: t("wallet.topUp"), facts }
            : { phase: "answered", label, actionLabel: t("wallet.topUp"), facts }
    }

    const transactionsView = (): LedgerSectionView => {
        const label = t("wallet.transactionsLabel")
        if (movements === null) {
            return { phase: "resting", label }
        }
        if (!movements.ok) {
            return { phase: "refused", label, note: t("refusal.unknown") }
        }
        if (movements.data.length === 0) {
            return { phase: "empty", label, note: t("wallet.transactionsEmpty") }
        }
        return {
            phase: "answered",
            label,
            /*
             * THE SIGN STAYS IN THE WORD RATHER THAN IN THE FIGURE. `type` is the backend's own word -
             * deposit or spend - so nothing here decides what a row means, and a minus in front of an
             * amount would read as an error state on a screen where a real one exists next door.
             */
            facts: movements.data.map((movement) => {
                const typeWord = t(`wallet.type.${movement.type}`)
                return {
                    id: movement.id,
                    label: `${day(movement.createdAt)} · ${typeWord}`,
                    value: amount(movement.amountVnd),
                }
            }),
        }
    }

    const invoicesView = (): LedgerSectionView => {
        const label = t("wallet.invoicesLabel")
        if (money === null) {
            return { phase: "resting", label }
        }
        if (!money.invoices.ok) {
            return { phase: "refused", label, note: t("refusal.unknown") }
        }
        if (money.invoices.data.length === 0) {
            return { phase: "empty", label, note: t("wallet.invoicesEmpty") }
        }
        const payLabel = payingInvoice ? t("wallet.paying") : t("wallet.pay")
        return {
            phase: "answered",
            label,
            actionLabel: money.invoices.data.some((invoice) => invoice.status === "unpaid")
                ? payLabel
                : undefined,
            /*
             * AN INVOICE IS THE ONE PLACE A HUMAN-READABLE PRODUCT LABEL IS LEGITIMATELY DERIVABLE.
             * `myInvoices` is the only handler that loads `catalogOrder.catalogItem` AND
             * `catalogOrder.catalogTier`, so the product and the rung are its own fields rather than a
             * guess. Where the relation is null - the foreign key is `ON DELETE SET NULL` - the row
             * says the amount and the state and claims nothing else.
             */
            facts: money.invoices.data.map((invoice) => {
                const item = invoice.catalogOrder?.catalogItem?.name
                const tier = invoice.catalogOrder?.catalogTier?.name
                const statusWord = t(`wallet.status.${invoice.status}`)
                // A payment that was refused says so on the row it was refused for, and nowhere else.
                const refusal = invoice.status === "unpaid" && paymentError !== null
                    ? ` · ${paymentError}`
                    : ""
                return {
                    id: invoice.id,
                    label: invoiceLabel(item, tier),
                    value: `${amount(invoice.amountVnd)} · ${statusWord}${refusal}`,
                }
            }),
        }
    }

    const payInvoice = async () => {
        if (payingInvoice || money?.invoices.ok !== true) {
            return
        }
        const invoice = money.invoices.data.find((row) => row.status === "unpaid")
        if (invoice === undefined) {
            return
        }
        setPayingInvoice(true)
        setPaymentError(null)
        const paid = await payInvoiceMutation(invoice.id)
        if (!paid.ok) {
            setPaymentError(paid.reason)
            setPayingInvoice(false)
            return
        }
        const [wallet, invoices, transactions] = await Promise.all([
            myWallet(),
            myInvoices(),
            myWalletTransactions(),
        ])
        setMoney({ wallet, invoices })
        setMovements(transactions)
        setPayingInvoice(false)
    }

    return (
        <WalletPageView
            title={t("wallet.title")}
            balance={balanceView()}
            transactions={transactionsView()}
            invoices={invoicesView()}
            on={{ payInvoice: () => void payInvoice() }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "connected" } as const
