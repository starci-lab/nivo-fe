import { SurfaceCard, Text, defineContractComponent, defineLeafComponent } from "@nivo/ui"
import type { AgentosModuleInstallationDetail } from "@/modules/api/console"

/** Canonical installation snapshot and resolved labels consumed by the summary block. */
export type AgentOSSolutionModuleSummaryProps = {
    readonly installation: AgentosModuleInstallationDetail
    readonly labels: {
        readonly section: string
        readonly module: string
        readonly version: string
        readonly status: string
        readonly failure: string
        readonly empty: string
    }
}

const fact = (label: string, value: string) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: label, size: "sm" }} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value, size: "sm" }} />),
})

/** Render package identity and lifecycle separately from generated runtime bindings. */
export const AgentOSSolutionModuleSummary = ({ installation, labels }: AgentOSSolutionModuleSummaryProps) => (
    <SurfaceCard
        props={{ label: labels.section }}
        contract="labelled-fact-stack"
        render={defineContractComponent("labelled-fact-stack", {
            fact: [
                fact(labels.module, installation.moduleKey),
                fact(labels.version, installation.moduleVersion),
                fact(labels.status, installation.status),
                fact(labels.failure, installation.failureCode ?? labels.empty),
            ],
        })}
    />
)

/** Source-level tier marker for the pure module summary block. */
export const meta = { shape: "block", world: "pure" } as const
