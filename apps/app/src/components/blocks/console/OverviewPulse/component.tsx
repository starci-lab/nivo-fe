import {
    IconTile,
    NivoUnicornArtwork,
    SurfaceCard,
    Text,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"

/** One independently settled account signal shown before detailed evidence. */
export type OverviewPulseSignal = {
    readonly id: string
    readonly icon: "apps" | "agentos" | "domains" | "wallet"
    readonly label: string
    readonly phase: "pending" | "answered" | "failed"
    readonly value: string
    readonly caption: string
    readonly emphasis?: "default" | "accent"
}

/** Resolved signal values consumed by the pure overview pulse. */
export type OverviewPulseProps = { readonly signals: ReadonlyArray<OverviewPulseSignal> }

const signalCard = (signal: OverviewPulseSignal) => {
    const isLoading = signal.phase === "pending"
    return defineContractProjection("account-signal-card", () => (
        <SurfaceCard
            contract="account-signal-card"
            render={defineContractComponent("account-signal-card", {
                heading: defineContractComponent("account-signal-heading", {
                    mark: defineLeafComponent("icon-tile", { size: "sm", tone: "accent" }, () => (
                        <IconTile props={{ icon: signal.icon, size: "sm", tone: "accent" }} isLoading={isLoading} />
                    )),
                    label: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                        <Text props={{ content: signal.label, size: "sm", weight: "medium" }} />
                    )),
                }),
                value: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: signal.value, size: "sm", tone: signal.emphasis ?? "default" }} isLoading={isLoading} />
                )),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: signal.caption, size: "xs", tone: "muted" }} isLoading={isLoading} />
                )),
            })}
            isLoading={isLoading}
        />
    ))
}

/** Draw four exact signals without fetching or deriving collection totals. */
export const OverviewPulseBase = ({ signals }: OverviewPulseProps) => (
    <Tree contract="account-signal-grid" render={defineContractComponent("account-signal-grid", {
        artwork: defineLeafComponent("nivo-unicorn-artwork", {}, () => (
            <NivoUnicornArtwork props={{ tone: "brand" }} />
        )),
        signal: signals.map(signalCard),
    })} />
)

/** Registry identity for the pure overview pulse twin. */
export const meta = { shape: "block", world: "pure" } as const
