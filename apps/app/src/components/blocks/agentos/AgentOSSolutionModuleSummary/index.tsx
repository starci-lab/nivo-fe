import {
    Badge,
    SurfaceCard,
    Text,
    defineContractComponent,
    defineLeafComponent,
    type BadgeTone,
} from "@nivo/ui"
import type { AgentosModuleInstallationDetail } from "@/modules/api/console"

/** Canonical installation snapshot and resolved labels consumed by the summary block. */
type AgentOSSolutionModuleSummaryLabels = {
    readonly section: string
    readonly module: string
    readonly version: string
    readonly status: string
    readonly failure: string
    readonly empty: string
}

/** Closed pending and answered inputs for the immutable installation summary. */
export type AgentOSSolutionModuleSummaryProps = {
    readonly labels: {
        readonly [K in keyof AgentOSSolutionModuleSummaryLabels]: AgentOSSolutionModuleSummaryLabels[K]
    }
} & (
    | { readonly state: "pending"; readonly installation?: never }
    | { readonly state: "ready"; readonly installation: AgentosModuleInstallationDetail }
)

const fact = (label: string, value?: string, isLoading = false) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: label, size: "sm" }} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value, size: "sm" }} isLoading={isLoading} />),
})

const statusTone = (status: AgentosModuleInstallationDetail["status"]): BadgeTone => {
    if (status === "ready") return "success"
    if (status === "failed") return "danger"
    return "accent"
}

/** Render package identity and lifecycle separately from generated runtime bindings. */
export const AgentOSSolutionModuleSummary = (input: AgentOSSolutionModuleSummaryProps) => {
    const isLoading = input.state === "pending"
    const installation = input.state === "ready" ? input.installation : undefined
    const { labels } = input

    return (
        <SurfaceCard
            props={{ label: labels.section }}
            contract="module-summary"
            render={defineContractComponent("module-summary", {
                identity: defineLeafComponent("text", { size: "md", weight: "semibold" }, () => (
                    <Text
                        props={{ content: installation?.moduleKey, size: "md", weight: "semibold" }}
                        isLoading={isLoading}
                    />
                )),
                status: defineLeafComponent("badge", {}, () => (
                    <Badge
                        props={{
                            content: installation?.status,
                            tone: installation === undefined ? "neutral" : statusTone(installation.status),
                        }}
                        isLoading={isLoading}
                    />
                )),
                facts: defineContractComponent("labelled-fact-stack", {
                    fact: [
                        fact(labels.module, installation?.moduleKey, isLoading),
                        fact(labels.version, installation?.moduleVersion, isLoading),
                        fact(labels.status, installation?.status, isLoading),
                        fact(labels.failure, installation?.failureCode ?? (isLoading ? undefined : labels.empty), isLoading),
                    ],
                }),
            })}
        />
    )
}

/** Source-level tier marker for the pure module summary block. */
export const meta = { shape: "block", world: "pure" } as const
