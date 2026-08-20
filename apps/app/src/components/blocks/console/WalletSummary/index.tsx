import { Button, Heading, SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"

/** One already-formatted wallet fact. */
export type WalletSummaryFact = {
    readonly id: string
    readonly label: string
    readonly value: string
}

/** Independently settled wallet situation. */
export type WalletSummaryState =
    | { readonly phase: "pending" }
    | { readonly phase: "empty", readonly facts: ReadonlyArray<WalletSummaryFact> }
    | { readonly phase: "populated", readonly facts: ReadonlyArray<WalletSummaryFact> }
    | { readonly phase: "failed", readonly note: string }
    | { readonly phase: "partial", readonly facts: ReadonlyArray<WalletSummaryFact>, readonly note: string }

/** Resolved wallet data, copy, and context-sensitive destination action. */
export type WalletSummaryProps = {
    readonly label: string
    readonly actionLabel?: string
    readonly state: WalletSummaryState
    readonly onOpenWallet?: () => void
}

const fact = (item: WalletSummaryFact, isLoading = false) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: item.label, size: "sm" }} isLoading={isLoading} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: item.value, size: "sm" }} isLoading={isLoading} />),
})

/** Draw balance and invoice evidence without calculating or formatting either value. */
export const WalletSummary = ({ label, actionLabel, state, onOpenWallet }: WalletSummaryProps) => {
    const isLoading = state.phase === "pending"
    const facts = state.phase === "empty" || state.phase === "populated" || state.phase === "partial" ? state.facts : []
    const note = state.phase === "failed" || state.phase === "partial" ? state.note : undefined
    const hasAction = actionLabel !== undefined && onOpenWallet !== undefined
    return (
        <SurfaceCard
            contract="wallet-summary"
            render={defineContractComponent("wallet-summary", {
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: label, level: 3 }} />),
                    ...(hasAction ? {
                        end: defineLeafComponent("button", {}, () => (
                            <Button props={{ label: actionLabel }} on={{ press: onOpenWallet }} />
                        )),
                    } : {}),
                }),
                facts: defineContractComponent("labelled-fact-stack", {
                    fact: isLoading
                        ? [fact({ id: "pending-1", label: "", value: "" }, true), fact({ id: "pending-2", label: "", value: "" }, true)]
                        : facts.map((item) => fact(item)),
                }),
                ...(note === undefined ? {} : {
                    note: defineContractComponent("body-with-refusal-note", {
                        note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: note, size: "sm", tone: "muted" }} />),
                    }),
                }),
            })}
        />
    )
}

/** Source-level tier marker for the pure wallet summary block. */
export const meta = { shape: "block", world: "pure" } as const
