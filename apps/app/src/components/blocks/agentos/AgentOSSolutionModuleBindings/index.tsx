import { SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentosModuleInstallationDetail } from "@/modules/api/console"

/** Runtime bindings and resolved labels consumed by the module bindings block. */
export type AgentOSSolutionModuleBindingsProps = {
    readonly installation: AgentosModuleInstallationDetail
    readonly labels: {
        readonly section: string
        readonly agents: string
        readonly channels: string
        readonly sharedKnowledge: string
        readonly knowledgeVersions: string
        readonly empty: string
    }
}

const fact = (label: string, value: string) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: label, size: "sm" }} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value, size: "sm" }} />),
})

const listValue = (values: ReadonlyArray<string>, empty: string) => values.length === 0 ? empty : values.join(", ")

/** Render generated agents, channels and common/private knowledge versions from the live snapshot. */
export const AgentOSSolutionModuleBindings = ({ installation, labels }: AgentOSSolutionModuleBindingsProps) => (
    <SurfaceCard
        props={{ label: labels.section }}
        contract="labelled-fact-stack"
        render={defineContractComponent("labelled-fact-stack", {
            fact: [
                fact(labels.agents, listValue(installation.generatedAgentIds, labels.empty)),
                fact(labels.channels, listValue(installation.channelAccountRefs, labels.empty)),
                fact(labels.sharedKnowledge, listValue(installation.sharedKnowledgeSourceIds, labels.empty)),
                fact(labels.knowledgeVersions, `${installation.commonKnowledgeVersion} · ${installation.privateKnowledgeVersion}`),
            ],
        })}
    />
)

/** Source-level tier marker for the pure module bindings block. */
export const meta = { shape: "block", world: "pure" } as const
