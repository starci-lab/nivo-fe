import { SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentConsoleBridgeState } from "@/modules/window/agent-console"
import type { AgentTasksRealtimeState } from "@/modules/realtime/agent-tasks"

/** Popup and realtime connection states with resolved customer copy. */
export type AgentOSConsoleConnectionProps = {
    readonly host: AgentConsoleBridgeState
    readonly realtime: AgentTasksRealtimeState
    readonly labels: {
        readonly section: string
        readonly mainSession: string
        readonly realtime: string
        readonly connected: string
        readonly connecting: string
        readonly disconnected: string
    }
}

/** Show whether the auxiliary console remains attached to Nivo and live AgentOS events. */
export const AgentOSConsoleConnection = ({ host, realtime, labels }: AgentOSConsoleConnectionProps) => {
    const value = (state: AgentConsoleBridgeState | AgentTasksRealtimeState) => labels[state]
    return (
        <SurfaceCard
            props={{ label: labels.section }}
            contract="labelled-fact-stack"
            render={defineContractComponent("labelled-fact-stack", {
                fact: [
                    defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: labels.mainSession, size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value(host), size: "sm", tone: host === "connected" ? "accent" : "muted" }} />),
                    }),
                    defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: labels.realtime, size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value(realtime), size: "sm", tone: realtime === "connected" ? "accent" : "muted" }} />),
                    }),
                ],
            })}
        />
    )
}

/** Source-level tier marker for the auxiliary-window connection block. */
export const meta = { shape: "block", world: "pure" } as const
