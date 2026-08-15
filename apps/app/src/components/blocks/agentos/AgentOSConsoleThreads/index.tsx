import {
    Badge,
    SurfaceCard,
    Text,
    defineContractComponent,
    defineLeafComponent,
} from "@nivo/ui"
import type { AgentThread } from "@/modules/api/console"

/** Resolved conversation-list copy and exact workspace rows. */
export type AgentOSConsoleThreadsProps = {
    readonly threads: ReadonlyArray<AgentThread>
    readonly labels: {
        readonly section: string
        readonly unread: string
        readonly read: string
        readonly messages: (count: number) => string
    }
}

/** Draw persisted OpenClaw conversations without exposing an upstream credential or protocol. */
export const AgentOSConsoleThreads = ({ threads, labels }: AgentOSConsoleThreadsProps) => (
    <SurfaceCard
        props={{ label: labels.section, isFrameless: true }}
        contract="claim-panel-grid"
        render={defineContractComponent("claim-panel-grid", {
            claim: threads.map((thread) => {
                const latest = thread.messages.at(-1)
                return defineContractComponent("attributed-claim-panel", {
                    claim: defineLeafComponent("text", {}, () => (
                        <Text props={{ content: latest === undefined ? thread.customerName : `${thread.customerName}: ${latest.body}` }} />
                    )),
                    note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: `${thread.channel} · ${labels.messages(thread.messages.length)}`, size: "sm", tone: "muted" }} />
                    )),
                    proof: defineLeafComponent("badge", {}, () => (
                        <Badge props={{ content: thread.hasUnread ? labels.unread : labels.read, tone: thread.hasUnread ? "warning" : "neutral" }} />
                    )),
                })
            }),
        })}
    />
)

/** Source-level tier marker for the OpenClaw conversation block. */
export const meta = { shape: "block", world: "pure" } as const
