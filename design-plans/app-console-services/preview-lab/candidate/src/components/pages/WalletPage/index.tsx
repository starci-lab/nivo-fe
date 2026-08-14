"use client"

import { useFormatter, useTranslations } from "next-intl"
import { Heading, Text } from "@nivo/ui"
import { SurfaceCard } from "@/branches/SurfaceCard"
import { Tree } from "@/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/contracts/props"
import wallet from "@/resources/my-wallet.fixture.json"
import transactions from "@/resources/my-wallet-transactions.fixture.json"
import invoices from "@/resources/my-invoices.fixture.json"

/**
 * PAGE - `page-wallet`: one account's money across all four services.
 *
 * TARGET PATH: `apps/app/src/components/pages/WalletPage/index.tsx`.
 * ROUTE ON MATERIALIZATION: `apps/app/src/app/[locale]/wallet/page.tsx`.
 *
 * IT IS UNDER THE ACCOUNT CAPTION RATHER THAN BESIDE THE SERVICES, because it talks ABOUT them: one
 * balance pays for an academy, a workspace and a domain alike, so it is not a fifth service.
 *
 * THERE IS NO ABSENT STATE, and that is a fact about the backend rather than a simplification.
 * `myWallet` CREATES the row on first read, so a brand-new account reads a real `balanceVnd: 0`. Zero
 * currency is an answer. Drawing an empty notice here would claim a state the transport cannot produce.
 *
 * THIS IS THE FIRST HONEST CALLER OF TWO KEYS. `labelled-fact-stack` and `label-value-row` are
 * callerless in shipped source and alive only through the child-slot exemption - the wallet's facts
 * are exactly what they describe: label-and-figure lines about ONE object, read as a set because the
 * space between them is smaller than the space around the run.
 *
 * NO COUNT, INCLUDING THE ONE THAT LOOKS INNOCENT. The lab drew an unpaid-invoice line reading zero, and
 * that is a count over a returned list. It is replaced by the AMOUNT owed and the date it is owed by
 * - two real fields - or by the words for "none". Both lists are complete rather than paged, but no
 * response DECLARES a total, so the screen states none.
 *
 * WHERE THE COPY AND THE FIGURES ARE RESOLVED. Here, for the reason the other two pages record: the
 * schema hands over an Int and an ISO string, and `useFormatter` under the served locale and time
 * zone is what turns them into a readable amount and a readable date. An unset time zone is a real
 * hydration mismatch on a page that prints dates, which is why the candidate's provider sets one.
 */

/** Which shape the wallet is in. */
export type WalletState = "balance" | "history"

/** Props for {@link WalletPage}. */
export interface WalletPageProps {
    /** The settled situation this route seals. */
    readonly state: WalletState
}

/** One movement of money, narrowed to what `myWalletTransactions` publishes. */
type TransactionRow = {
    readonly id: string
    readonly amountVnd: number
    readonly type: string
    readonly createdAt: string
}

/** The order an invoice was raised for, loaded two levels by this one handler alone. */
type InvoiceOrder = {
    readonly catalogItem: { readonly name: string } | null
    readonly catalogTier: { readonly name: string } | null
}

/** One invoice, narrowed to the amount, the state, the date it is owed by and what it bought. */
type InvoiceRow = {
    readonly id: string
    readonly amountVnd: number
    readonly status: string
    readonly dueAt: string | null
    readonly catalogOrder: InvoiceOrder | null
}

/** Every movement of money, newest first, as the handler orders them. */
const TRANSACTIONS = transactions.answered.data as ReadonlyArray<TransactionRow>

/** Every invoice, newest first. */
const INVOICES = invoices.answered.data as ReadonlyArray<InvoiceRow>

/**
 * The account's money.
 *
 * @param input - {@link WalletPageProps}
 * @returns The page node.
 */
export const WalletPage = ({ state }: WalletPageProps) => {
    const t = useTranslations("console")
    const format = useFormatter()

    const money = (amountVnd: number) =>
        format.number(amountVnd, { style: "currency", currency: "VND", maximumFractionDigits: 0 })

    const day = (iso: string) => format.dateTime(new Date(iso), { day: "2-digit", month: "2-digit" })

    const factRow = (label: string, value: string) => defineContractComponent("label-value-row", {
        label: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: label, size: "sm" }} />
        )),
        value: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: value, size: "sm" }} />
        )),
    })

    const titleRow = (label: string, level: 1 | 3) => defineContractComponent("title-with-end-action", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level }} />),
    })

    const unpaid = INVOICES.find((invoice) => invoice.status === "unpaid")

    /*
     * THE BALANCE IS ITS OWN SECTION, ABOVE EVERYTHING ELSE. It is the one figure a reader came for,
     * and inside the transaction list it would read as a property of the transactions rather than of
     * the account.
     */
    const balanceSection = defineContractProjection("label-row-over-card", () => (
        <SurfaceCard
            props={{ label: t("wallet.balanceLabel"), seeMoreLabel: t("wallet.topUp") }}
            on={{ seeMore: () => undefined }}
            contract="labelled-fact-stack"
            render={defineContractComponent("labelled-fact-stack", {
                fact: [
                    factRow(t("wallet.balanceLabel"), money(wallet.answered.data.balanceVnd)),
                    factRow(
                        t("wallet.unpaidLabel"),
                        unpaid === undefined || unpaid.dueAt === null
                            ? t("wallet.noUnpaid")
                            : `${money(unpaid.amountVnd)} · ${t("wallet.dueAt", { date: day(unpaid.dueAt) })}`,
                    ),
                ],
            })}
        />
    ))

    /*
     * A MOVEMENT IS NAMED BY WHEN IT HAPPENED AND WHICH DIRECTION IT WENT. `type` is the backend's
     * own word - deposit or spend - so nothing here decides what a row means; the sign stays in the
     * word rather than in the figure, because a minus in front of an amount reads as an error state
     * on a screen where a real one exists next door.
     */
    const transactionsSection = defineContractProjection("label-row-over-card", () => (
        <SurfaceCard
            props={{ label: t("wallet.transactionsLabel") }}
            contract="labelled-fact-stack"
            render={defineContractComponent("labelled-fact-stack", {
                fact: TRANSACTIONS.map((movement) => factRow(
                    `${day(movement.createdAt)} · ${t(`wallet.type.${movement.type}`)}`,
                    money(movement.amountVnd),
                )),
            })}
        />
    ))

    /*
     * AN INVOICE IS THE ONE PLACE A HUMAN-READABLE PRODUCT LABEL IS LEGITIMATELY DERIVABLE. `myInvoices`
     * is the only handler that loads `catalogOrder.catalogItem` AND `catalogOrder.catalogTier`, so the
     * product and the rung are its own fields rather than a guess. Where the relation is null - the FK
     * is `ON DELETE SET NULL` - the row says the amount and the state and claims nothing else.
     */
    const invoicesSection = defineContractProjection("label-row-over-card", () => (
        <SurfaceCard
            props={{ label: t("wallet.invoicesLabel") }}
            contract="labelled-fact-stack"
            render={defineContractComponent("labelled-fact-stack", {
                fact: INVOICES.map((invoice) => {
                    const item = invoice.catalogOrder?.catalogItem?.name
                    const tier = invoice.catalogOrder?.catalogTier?.name
                    const label = item === undefined
                        ? t("wallet.invoicesLabel")
                        : tier === undefined ? item : `${item} · ${tier}`
                    return factRow(label, `${money(invoice.amountVnd)} · ${t(`wallet.status.${invoice.status}`)}`)
                }),
            })}
        />
    ))

    const emptySection = (label: string, content: string) => defineContractComponent("label-row-over-card", {
        label: titleRow(label, 3),
        body: defineLeafComponent("text", {}, () => (
            <Text props={{ content, size: "sm", tone: "muted" }} />
        )),
    })

    const historySections = [
        TRANSACTIONS.length === 0
            ? emptySection(t("wallet.transactionsLabel"), t("wallet.transactionsEmpty"))
            : transactionsSection,
        INVOICES.length === 0
            ? emptySection(t("wallet.invoicesLabel"), t("wallet.invoicesEmpty"))
            : invoicesSection,
    ]

    return (
        <Tree
            contract="titled-section-stack-page"
            render={defineContractComponent("titled-section-stack-page", {
                heading: titleRow(t("wallet.title"), 1),
                section: state === "history" ? [balanceSection, ...historySections] : [balanceSection],
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "connected" } as const
