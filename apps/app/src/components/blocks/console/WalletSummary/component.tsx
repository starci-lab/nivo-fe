import { Button, SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"

/** One exact balance or invoice fact displayed by the wallet summary. */
export type WalletSummaryFact = { readonly id: string, readonly label: string, readonly value: string, readonly emphasis?: boolean }
/** Independently settled wallet and invoice states. */
export type WalletSummaryState =
    | { readonly phase: "pending" }
    | { readonly phase: "empty", readonly facts: ReadonlyArray<WalletSummaryFact> }
    | { readonly phase: "populated", readonly facts: ReadonlyArray<WalletSummaryFact> }
    | { readonly phase: "failed", readonly note: string }
    | { readonly phase: "partial", readonly facts: ReadonlyArray<WalletSummaryFact>, readonly note: string }
/** Pure wallet summary input and its legal wallet commands. */
export type WalletSummaryProps = {
    readonly label: string
    readonly actionLabel?: string
    readonly secondaryActionLabel?: string
    readonly state: WalletSummaryState
    readonly onOpenWallet?: () => void
    readonly onTopUp?: () => void
}

const fact = (item: WalletSummaryFact, isLoading = false) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: item.label, size: "sm", tone: "muted" }} isLoading={isLoading} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: item.value, size: "sm", weight: item.emphasis === true ? "semibold" : undefined }} isLoading={isLoading} />),
})

/** Draw exact balance and invoice evidence with their two legal routes. */
export const WalletSummaryBase = ({ label, actionLabel, secondaryActionLabel, state, onOpenWallet, onTopUp }: WalletSummaryProps) => {
    const isLoading = state.phase === "pending"
    const facts = state.phase === "empty" || state.phase === "populated" || state.phase === "partial" ? state.facts : []
    const note = state.phase === "failed" || state.phase === "partial" ? state.note : undefined
    return <SurfaceCard
        props={{ label, seeMoreLabel: actionLabel }}
        on={{ seeMore: onOpenWallet }}
        contract="wallet-summary"
        render={defineContractComponent("wallet-summary", {
            facts: defineContractComponent("labelled-fact-stack", {
                fact: isLoading
                    ? [fact({ id: "pending-balance", label: "", value: "", emphasis: true }, true), fact({ id: "pending-invoice", label: "", value: "" }, true)]
                    : facts.map((item) => fact(item)),
            }),
            ...(secondaryActionLabel !== undefined && onTopUp !== undefined ? {
                action: defineLeafComponent("button", {}, () => <Button props={{ label: secondaryActionLabel, variant: "primary" }} on={{ press: onTopUp }} />),
            } : {}),
            ...(note === undefined ? {} : { note: defineContractComponent("body-with-refusal-note", {
                note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: note, size: "sm", tone: "muted" }} />),
            }) }),
        })}
        isLoading={isLoading}
    />
}

/** Registry identity for the pure wallet summary twin. */
export const meta = { shape: "block", world: "pure" } as const
