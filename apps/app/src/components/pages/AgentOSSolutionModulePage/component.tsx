import {
    Heading,
    Text,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import { AgentOSSolutionModuleBindings } from "@/components/blocks/agentos/AgentOSSolutionModuleBindings"
import { AgentOSSolutionModuleSummary } from "@/components/blocks/agentos/AgentOSSolutionModuleSummary"
import type { AgentosModuleInstallationDetail } from "@/modules/api/console"

/** Resolved labels for one module installation detail route. */
export type AgentOSSolutionModulePageLabels = {
    readonly title: string
    readonly loading: string
    readonly refused: string
    readonly summary: Parameters<typeof AgentOSSolutionModuleSummary>[0]["labels"]
    readonly bindings: Parameters<typeof AgentOSSolutionModuleBindings>[0]["labels"]
}

/** Closed loading, refusal and answered states for the pure module page. */
export type AgentOSSolutionModulePageViewProps = {
    readonly state: "loading" | "refused" | "ready"
    readonly installation?: AgentosModuleInstallationDetail
    readonly labels: AgentOSSolutionModulePageLabels
}

/** Compose one exact installation snapshot without owning API or realtime mechanics. */
export const AgentOSSolutionModulePageBase = ({ state, installation, labels }: AgentOSSolutionModulePageViewProps) => {
    // A refusal and a missing installation are the same page: there is nothing to lay out, so the
    // stack carries the one notice rather than two empty cards.
    const settledSections = state === "refused" || installation === undefined
        ? [defineContractProjection("label-row-over-card", () => <EmptyNotice props={{ message: labels.refused }} />)]
        : [
            defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleSummary state="ready" installation={installation} labels={labels.summary} />),
            defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleBindings state="ready" installation={installation} labels={labels.bindings} />),
        ]
    const sections = state === "loading"
        ? [
            defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleSummary state="pending" labels={labels.summary} />),
            defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleBindings state="pending" labels={labels.bindings} />),
        ]
        : settledSections
    return (
        <Tree
            contract="titled-section-stack-page"
            render={defineContractComponent("titled-section-stack-page", {
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.title, level: 1 }} />),
                }),
                lede: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: state === "loading" ? labels.loading : installation?.moduleKey ?? labels.title, size: "sm", tone: "muted" }} />),
                section: sections,
            })}
        />
    )
}

/** Source-level tier marker for the pure module detail page. */
export const meta = { shape: "page", world: "pure" } as const
