import {
    Heading,
    SurfaceCard,
    Text,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"

/**
 * PAGE (drawing half) - one account's money across all four services.
 *
 * IT IS UNDER THE ACCOUNT CAPTION RATHER THAN BESIDE THE SERVICES, because it talks ABOUT them: one
 * balance pays for an academy, a workspace and a domain alike, so it is not a fifth service.
 *
 * THERE IS NO ABSENT STATE FOR THE BALANCE, and that is a fact about the backend rather than a
 * simplification. `myWallet` CREATES the row on first read, so a brand-new account reads a real
 * `balanceVnd: 0`. Zero currency is an answer, and an empty notice here would claim a state the
 * transport cannot produce - which is why the empty arm differs from the answered one only in where
 * its way out leads.
 *
 * THIS IS THE FIRST HONEST CALLER OF TWO KEYS. `labelled-fact-stack` and `label-value-row` describe
 * exactly what the wallet holds: label-and-figure lines about ONE object, read as a set because the
 * space between them is smaller than the space around the run.
 *
 * NO COUNT, INCLUDING THE ONE THAT LOOKS INNOCENT. An unpaid-invoice line reading zero is a count
 * over a returned list. It is replaced by the AMOUNT owed and the date it is owed by - two real
 * fields - or by the words for "none". Both ledgers are complete rather than paged, but no response
 * DECLARES a total, so the screen states none.
 *
 * IT FORMATS NOTHING. Every amount and every date arrives finished, because the schema hands over an
 * Int and an ISO string and only the connected half may ask which locale and which time zone are
 * being served.
 */

/** One label-and-figure line about the account's money. */
export type WalletFactRow = {
    /** The line's identity, and its React key. */
    readonly id: string
    /** What the figure is. */
    readonly label: string
    /** The figure, already formatted. */
    readonly value: string
}

/**
 * The balance section: the one figure a reader came for.
 *
 * It is its own section, above everything else, because inside the transaction list it would read as
 * a property of the transactions rather than of the account.
 */
export type BalanceSectionView =
    | { readonly phase: "resting", readonly label: string, readonly actionLabel: string }
    | {
        readonly phase: "empty"
        readonly label: string
        readonly actionLabel: string
        readonly facts: ReadonlyArray<WalletFactRow>
    }
    | {
        readonly phase: "answered"
        readonly label: string
        readonly actionLabel: string
        readonly facts: ReadonlyArray<WalletFactRow>
    }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

/** One of the two ledgers below the balance: the movements, or the invoices. */
export type LedgerSectionView =
    | { readonly phase: "resting", readonly label: string }
    | { readonly phase: "empty", readonly label: string, readonly note: string }
    | {
        readonly phase: "answered"
        readonly label: string
        readonly facts: ReadonlyArray<WalletFactRow>
        /** The one available ledger action, when this ledger owns one. */
        readonly actionLabel?: string
    }
    | { readonly phase: "refused", readonly label: string, readonly note: string }

/** What the wallet reports back to the half that owns the router. */
export type WalletPageActions = {
    /** Called when the reader takes the way out of the balance section. */
    readonly topUp?: () => void
    /** Settles the newest unpaid invoice shown by the invoice ledger. */
    readonly payInvoice?: () => void
}

/** Props for {@link _WalletPage}. */
export interface WalletPageViewProps {
    /** The page's own name. */
    readonly title: string
    /** The balance section's settled situation. */
    readonly balance: BalanceSectionView
    /** The movements ledger's settled situation. */
    readonly transactions: LedgerSectionView
    /** The invoices ledger's settled situation. */
    readonly invoices: LedgerSectionView
    /** Where the one way out leads. */
    readonly on?: WalletPageActions
}

/** The two lines a resting fact stack draws before it knows what it holds. */
const RESTING_FACTS: ReadonlyArray<WalletFactRow> = [
    { id: "resting-1", label: "", value: "" },
    { id: "resting-2", label: "", value: "" },
]

/**
 * One label-and-figure line.
 *
 * @param row - The already-formatted line.
 * @param isLoading - Whether the figure is still being waited on.
 * @returns The line, bound to its contract identity.
 */
const factRow = (row: WalletFactRow, isLoading: boolean) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => (
        <Text props={{ content: row.label, size: "sm" }} isLoading={isLoading} />
    )),
    value: defineLeafComponent("text", { size: "sm" }, () => (
        <Text props={{ content: row.value, size: "sm" }} isLoading={isLoading} />
    )),
})

/**
 * A section that says one sentence in the column its lines would have used.
 *
 * @param label - The section's name.
 * @param note - The sentence.
 * @returns The section, bound to its contract identity.
 */
const sentenceSection = (label: string, note: string) => defineContractComponent("label-row-over-card", {
    label: defineContractComponent("title-with-end-action", {
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level: 3 }} />),
    }),
    body: defineLeafComponent("text", {}, () => (
        <Text props={{ content: note, size: "sm", tone: "muted" }} />
    )),
})

/**
 * A section whose subject was REFUSED rather than empty.
 *
 * @param label - The section's name.
 * @param note - The refusal, in the reader's words.
 * @returns The section, bound to its contract identity.
 */
const refusedSection = (label: string, note: string) => defineContractProjection("label-row-over-card", () => (
    <SurfaceCard
        props={{ label }}
        contract="body-with-refusal-note"
        render={defineContractComponent("body-with-refusal-note", {
            note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: note, size: "sm", tone: "muted" }} />
            )),
        })}
    />
))

/**
 * The account's money.
 *
 * @param input - {@link WalletPageViewProps}
 * @returns The page node.
 */
export const _WalletPage = ({ title, balance, transactions, invoices, on }: WalletPageViewProps) => {
    const balanceSection = () => {
        if (balance.phase === "refused") {
            return refusedSection(balance.label, balance.note)
        }
        const isResting = balance.phase === "resting"
        const facts = balance.phase === "resting" ? RESTING_FACTS : balance.facts
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{ label: balance.label, seeMoreLabel: balance.actionLabel }}
                on={{ seeMore: on?.topUp }}
                contract="labelled-fact-stack"
                render={defineContractComponent("labelled-fact-stack", {
                    fact: facts.map((row) => factRow(row, isResting)),
                })}
                isLoading={isResting}
            />
        ))
    }

    /*
     * A MOVEMENT IS NAMED BY WHEN IT HAPPENED AND WHICH DIRECTION IT WENT, and an invoice by what it
     * bought and whether it is settled. Both are label-and-figure lines about one object, so both take
     * the same ledger shape rather than two that would differ by accident.
     */
    const ledgerSection = (ledger: LedgerSectionView, action?: () => void) => {
        if (ledger.phase === "empty" || ledger.phase === "refused") {
            return ledger.phase === "empty"
                ? sentenceSection(ledger.label, ledger.note)
                : refusedSection(ledger.label, ledger.note)
        }
        const isResting = ledger.phase === "resting"
        const facts = ledger.phase === "resting" ? RESTING_FACTS : ledger.facts
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard
                props={{
                    label: ledger.label,
                    seeMoreLabel: ledger.phase === "answered" ? ledger.actionLabel : undefined,
                }}
                on={{ seeMore: action }}
                contract="labelled-fact-stack"
                render={defineContractComponent("labelled-fact-stack", {
                    fact: facts.map((row) => factRow(row, isResting)),
                })}
                isLoading={isResting}
            />
        ))
    }

    return (
        <Tree
            contract="titled-section-stack-page"
            render={defineContractComponent("titled-section-stack-page", {
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 1 }} />),
                }),
                section: [balanceSection(), ledgerSection(transactions), ledgerSection(invoices, on?.payInvoice)],
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "page", world: "pure" } as const
