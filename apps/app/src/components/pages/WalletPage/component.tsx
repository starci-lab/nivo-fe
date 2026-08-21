import {
    Badge, Button, DrawerBranch, Field, Heading, ModalBranch, SurfaceCard, SurfaceListCard, Text, Tree,
    defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent,
    type BadgeTone, type LeafProps, type SurfaceListCardActions, type SurfaceListCardData,
} from "@nivo/ui"

/** One already-formatted label and value used by wallet evidence surfaces. */
export type WalletFactRow = { readonly id: string, readonly label: string, readonly value: string }
/** Settled presentation state of the balance surface. */
export type BalanceSectionView =
    | { readonly phase: "resting", readonly label: string, readonly actionLabel: string }
    | { readonly phase: "answered" | "empty", readonly label: string, readonly actionLabel: string, readonly facts: ReadonlyArray<WalletFactRow> }
    | { readonly phase: "refused", readonly label: string, readonly note: string }
/** One movement or invoice row with the complete evidence its detail drawer reveals. */
export type WalletLedgerRow = {
    readonly id: string
    readonly title: string
    readonly caption: string
    readonly amount: string
    readonly state: string
    readonly tone: BadgeTone
    readonly detailLabel: string
    readonly detailFacts: ReadonlyArray<WalletFactRow>
    readonly note?: string
}
/** Settled presentation state of one joined wallet ledger. */
export type LedgerSectionView =
    | { readonly phase: "resting", readonly label: string }
    | { readonly phase: "empty" | "refused", readonly label: string, readonly note: string }
    | { readonly phase: "answered", readonly label: string, readonly rows: ReadonlyArray<WalletLedgerRow>, readonly actionLabel?: string }
/** Controlled state and copy for the top-up modal. */
export type TopUpView = {
    readonly open: boolean
    readonly title: string
    readonly closeLabel: string
    readonly amountLabel: string
    readonly amountPlaceholder: string
    readonly hint: string
    readonly submitLabel: string
    readonly amount: string
    readonly pending: boolean
    readonly refusal?: string
    readonly checkout?: { readonly reference: string, readonly amount: string, readonly note: string }
}
/** Honest provider-return state shown after balance reconciliation. */
export type PaymentResultView = {
    readonly open: boolean
    readonly title: string
    readonly closeLabel: string
    readonly state: string
    readonly tone: BadgeTone
    readonly amount: string
    readonly reference?: string
    readonly note: string
    readonly actionLabel: string
}
/** User outcomes reported from the pure wallet drawing. */
export type WalletPageActions = {
    readonly topUp?: () => void
    readonly closeTopUp?: () => void
    readonly changeTopUpAmount?: (value: string) => void
    readonly submitTopUp?: () => void
    readonly closeResult?: () => void
    readonly payInvoice?: () => void
}
/** Complete pure input for the accepted wallet/payment flow. */
export interface WalletPageViewProps {
    readonly title: string
    readonly balance: BalanceSectionView
    readonly transactions: LedgerSectionView
    readonly invoices: LedgerSectionView
    readonly topUp: TopUpView
    readonly result: PaymentResultView
    readonly on?: WalletPageActions
}

const RESTING_FACTS: ReadonlyArray<WalletFactRow> = [
    { id: "resting-1", label: "", value: "" }, { id: "resting-2", label: "", value: "" },
]
const factRow = (row: WalletFactRow, isLoading = false) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: row.label, size: "sm" }} isLoading={isLoading} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: row.value, size: "sm" }} isLoading={isLoading} />),
})
const sectionLabel = (label: string) => defineContractComponent("title-with-end-action", {
    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level: 3 }} />),
})
const noteSection = (label: string, note: string) => defineContractProjection("label-row-over-card", () => (
    <SurfaceCard props={{ label }} contract="body-with-refusal-note" render={defineContractComponent("body-with-refusal-note", {
        note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: note, size: "sm", tone: "muted" }} />),
    })} />
))

/** Pure drawing half of the accepted wallet and payment flow. */
export const WalletPageBase = ({ title, balance, transactions, invoices, topUp, result, on }: WalletPageViewProps) => {
    const balanceSection = () => {
        if (balance.phase === "refused") return noteSection(balance.label, balance.note)
        const loading = balance.phase === "resting"
        const facts = loading ? RESTING_FACTS : balance.facts
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceCard props={{ label: balance.label }} contract="wallet-balance-surface" render={defineContractComponent("wallet-balance-surface", {
                facts: defineContractComponent("labelled-fact-stack", { fact: facts.map((row) => factRow(row, loading)) }),
                shortcuts: defineContractComponent("inline-action-run", {
                    action: [defineLeafComponent("button", {}, () => <Button props={{ label: balance.actionLabel, variant: "primary" }} on={{ press: on?.topUp }} isLoading={loading} />)],
                }),
            })} isLoading={loading} />
        ))
    }

    const ledgerSection = (ledger: LedgerSectionView, action?: () => void) => {
        if (ledger.phase === "empty" || ledger.phase === "refused") return noteSection(ledger.label, ledger.note)
        const rows: ReadonlyArray<WalletLedgerRow> = ledger.phase === "answered" ? ledger.rows : []
        const Content = defineContractComponent("wallet-ledger-list", (input: LeafProps<SurfaceListCardData, SurfaceListCardActions>) => {
            void input
            return (
            <Tree contract="wallet-ledger-list" render={defineContractComponent("wallet-ledger-list", {
                row: (ledger.phase === "resting" ? [0, 1, 2] : rows).map((entry) => {
                    const row = typeof entry === "number" ? undefined : entry
                    return defineContractComponent("wallet-ledger-row", {
                        identity: defineContractComponent("subject-over-muted-caption", {
                            subject: defineLeafComponent("text", {}, () => <Text props={{ content: row?.title ?? "", size: "sm" }} isLoading={ledger.phase === "resting"} />),
                            caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: row?.caption ?? "", size: "xs", tone: "muted" }} isLoading={ledger.phase === "resting"} />),
                        }),
                        state: defineLeafComponent("badge", {}, () => <Badge props={{ content: row?.state ?? "", tone: row?.tone ?? "neutral" }} isLoading={ledger.phase === "resting"} />),
                        amount: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: row?.amount ?? "", size: "sm", weight: "semibold" }} isLoading={ledger.phase === "resting"} />),
                        action: row === undefined ? undefined : defineLeafComponent("button", {}, () => <DrawerBranch
                            triggerLabel={row.detailLabel} title={row.title} closeLabel={topUp.closeLabel}
                            content={<Tree contract="wallet-ledger-detail" render={defineContractComponent("wallet-ledger-detail", {
                                facts: defineContractComponent("labelled-fact-stack", { fact: row.detailFacts.map((fact) => factRow(fact)) }),
                                note: row.note === undefined ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: row.note ?? "", size: "sm", tone: "muted" }} />),
                            })} />}
                        />),
                    })
                }),
            })} />
            )
        })
        return defineContractProjection("label-row-over-card", () => (
            <SurfaceListCard contract="wallet-ledger-list" render={Content} props={{ label: ledger.label, actionLabel: ledger.phase === "answered" ? ledger.actionLabel : undefined }} on={{ act: action }} isLoading={ledger.phase === "resting"} />
        ))
    }

    const topUpContent = topUp.checkout === undefined ? (
        <Tree contract="wallet-top-up-form" render={defineContractComponent("wallet-top-up-form", {
            field: defineCompositeComponent("field", {}, () => <Field props={{ id: "wallet-top-up-amount", name: "amountVnd", label: topUp.amountLabel, kind: "text", placeholder: topUp.amountPlaceholder, disabled: topUp.pending, isInvalid: topUp.refusal !== undefined }} on={{ change: on?.changeTopUpAmount }} />),
            note: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: topUp.hint, size: "xs", tone: "muted" }} />),
            action: defineLeafComponent("button", {}, () => <Button props={{ label: topUp.submitLabel, variant: "primary", isPending: topUp.pending }} on={{ press: on?.submitTopUp }} />),
            refusal: topUp.refusal === undefined ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: topUp.refusal ?? "", size: "sm", tone: "muted", live: "assertive" }} />),
        })} />
    ) : <Tree contract="wallet-checkout-evidence" render={defineContractComponent("wallet-checkout-evidence", {
        reference: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: topUp.checkout?.reference ?? "", size: "sm" }} />),
        amount: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: topUp.checkout?.amount ?? "", size: "sm", weight: "semibold" }} />),
        note: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: topUp.checkout?.note ?? "", size: "xs", tone: "muted" }} />),
    })} />

    const resultContent = <Tree contract="wallet-payment-result" render={defineContractComponent("wallet-payment-result", {
        state: defineLeafComponent("badge", {}, () => <Badge props={{ content: result.state, tone: result.tone }} />),
        amount: defineLeafComponent("heading", {}, () => <Heading props={{ content: result.amount, level: 2 }} />),
        reference: result.reference === undefined ? undefined : defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: result.reference ?? "", size: "sm", tone: "muted" }} />),
        note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: result.note, size: "sm", tone: "muted" }} />),
        action: defineLeafComponent("button", {}, () => <Button props={{ label: result.actionLabel, variant: "primary" }} on={{ press: on?.closeResult }} />),
    })} />

    return <>
        <Tree contract="titled-section-stack-page" render={defineContractComponent("titled-section-stack-page", {
            heading: sectionLabel(title), section: [balanceSection(), ledgerSection(transactions), ledgerSection(invoices, on?.payInvoice)],
        })} />
        <ModalBranch isOpen={topUp.open} title={topUp.title} closeLabel={topUp.closeLabel} content={topUpContent} onDismiss={() => on?.closeTopUp?.()} />
        <ModalBranch isOpen={result.open} title={result.title} closeLabel={result.closeLabel} content={resultContent} onDismiss={() => on?.closeResult?.()} />
    </>
}

/** Source-level tier marker for the pure page half. */
export const meta = { shape: "page", world: "pure" } as const
