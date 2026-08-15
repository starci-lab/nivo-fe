import { Heading, Text, Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import { AgentOSConsoleThreads } from "@/components/blocks/agentos/AgentOSConsoleThreads"
import { AgentOSConsoleConnection } from "@/components/blocks/agentos/AgentOSConsoleConnection"
import type { AgentThread } from "@/modules/api/console"
import type { AgentConsoleBridgeState } from "@/modules/window/agent-console"
import type { AgentTasksRealtimeState } from "@/modules/realtime/agent-tasks"

/** Settled state and translated copy for the pure AgentOS console page. */
export type AgentOSConsolePageViewProps = {
    readonly state: "loading" | "refused" | "empty" | "ready"
    readonly threads: ReadonlyArray<AgentThread>
    readonly hostConnection: AgentConsoleBridgeState
    readonly realtimeConnection: AgentTasksRealtimeState
    readonly labels: {
        readonly title: string
        readonly lede: string
        readonly section: string
        readonly loading: string
        readonly empty: string
        readonly refused: string
        readonly unread: string
        readonly read: string
        readonly messages: (count: number) => string
        readonly connection: Parameters<typeof AgentOSConsoleConnection>[0]["labels"]
    }
}

/** Compose the Nivo-owned OpenClaw console; it never embeds the raw OpenClaw gateway. */
export const _AgentOSConsolePage = ({ state, threads, hostConnection, realtimeConnection, labels }: AgentOSConsolePageViewProps) => (
    <Tree contract="titled-section-stack-page" render={defineContractComponent("titled-section-stack-page", {
        heading: defineContractComponent("title-with-end-action", {
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.title, level: 1 }} />),
        }),
        lede: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: labels.lede, size: "sm", tone: "muted" }} />),
        section: [
            defineContractProjection("label-row-over-card", () => <AgentOSConsoleConnection host={hostConnection} realtime={realtimeConnection} labels={labels.connection} />),
            defineContractProjection("label-row-over-card", () => state === "ready"
                ? <AgentOSConsoleThreads threads={threads} labels={labels} />
                : <EmptyNotice props={{ message: state === "loading" ? labels.loading : state === "empty" ? labels.empty : labels.refused }} />),
        ],
    })} />
)

/** Source-level tier marker for the pure AgentOS console page twin. */
export const meta = { shape: "page", world: "pure" } as const
