import {
    SurfaceCard,
    Text,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"

/** One independently settled account signal shown before the detailed overview sections. */
export type OverviewPulseSignal = {
    readonly id: string
    readonly label: string
    readonly phase: "pending" | "answered" | "failed"
    readonly value: string
    readonly caption: string
    readonly emphasis?: "default" | "accent"
}

/** Resolved signal values consumed by the pure overview pulse. */
export type OverviewPulseProps = {
    readonly signals: ReadonlyArray<OverviewPulseSignal>
}

const signalCard = (signal: OverviewPulseSignal) => {
    const isLoading = signal.phase === "pending"
    return defineContractProjection("account-signal-card", () => (
        <SurfaceCard
            contract="account-signal-card"
            render={defineContractComponent("account-signal-card", {
                label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: signal.label, size: "xs", tone: "muted" }} />
                )),
                value: defineLeafComponent("text", { size: "metric-lead", weight: "semibold" }, () => (
                    <Text
                        props={{
                            content: signal.value,
                            size: "metric-lead",
                            weight: "semibold",
                            tone: signal.emphasis ?? "default",
                        }}
                        isLoading={isLoading}
                    />
                )),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text
                        props={{ content: signal.caption, size: "xs", tone: "muted" }}
                        isLoading={isLoading}
                    />
                )),
            })}
            isLoading={isLoading}
        />
    ))
}

/** Draw the four account signals without deriving totals or reading external state. */
export const OverviewPulse = ({ signals }: OverviewPulseProps) => (
    <Tree
        contract="account-signal-grid"
        render={defineContractComponent("account-signal-grid", {
            signal: signals.map((signal) => signalCard(signal)),
        })}
    />
)

/** Source-level tier marker for the pure account-signal block. */
export const meta = { shape: "block", world: "pure" } as const
