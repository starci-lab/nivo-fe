import { SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentWorkspaceControlCenter } from "@/modules/api/console"

/** Stable workspace identity and labels consumed by the summary block. */
export type AgentOSWorkspaceSummaryProps = {
    readonly data: AgentWorkspaceControlCenter
    readonly labels: {
        readonly section: string
        readonly status: string
        readonly plan: string
        readonly allocation: string
        readonly host: string
        readonly chart: string
    }
}

const fact = (label: string, value: string) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: label, size: "sm" }} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value, size: "sm" }} />),
})

/** Show stable workspace identity and commercial allocation separately from live usage. */
export const AgentOSWorkspaceSummary = ({ data, labels }: AgentOSWorkspaceSummaryProps) => (
    <SurfaceCard
        props={{ label: labels.section }}
        contract="labelled-fact-stack"
        render={defineContractComponent("labelled-fact-stack", {
            fact: [
                fact(labels.status, data.workspace.status),
                fact(labels.plan, data.instance.planCode ?? "—"),
                fact(labels.allocation, `${data.instance.ramMb} MB · ${data.instance.vcpu} vCPU`),
                fact(labels.host, data.instance.hostname),
                fact(labels.chart, data.instance.chartVersion),
            ],
        })}
    />
)

/** Source-level tier marker for the pure summary block. */
export const meta = { shape: "block", world: "pure" } as const
