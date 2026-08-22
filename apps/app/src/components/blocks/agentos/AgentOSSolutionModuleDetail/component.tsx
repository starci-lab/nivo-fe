import {
    Heading,
    Text,
    TextLink,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import { AgentOSSolutionModuleBindings } from "@/components/blocks/agentos/AgentOSSolutionModuleBindings"
import { AgentOSSolutionModuleSummary } from "@/components/blocks/agentos/AgentOSSolutionModuleSummary"
import type { AgentosModuleInstallationDetail } from "@/modules/api/console"

/** Detail-block states for one module installation snapshot. */
export type AgentOSSolutionModuleDetailState = "loading" | "refused" | "ready"

/** Resolved labels for one module installation detail route. */
export type AgentOSSolutionModuleDetailLabels = {
    readonly title: string
    readonly backToWorkspace: string
    readonly loading: string
    readonly refused: string
    readonly summary: Parameters<typeof AgentOSSolutionModuleSummary>[0]["labels"]
    readonly bindings: Parameters<typeof AgentOSSolutionModuleBindings>[0]["labels"]
}

/** Fixed module page anatomy with an independently settled detail block. */
export type AgentOSSolutionModuleDetailViewProps = {
    readonly detailState: AgentOSSolutionModuleDetailState
    readonly installation?: AgentosModuleInstallationDetail
    readonly labels: AgentOSSolutionModuleDetailLabels
    readonly onBack: () => void
}

/** Compose one exact installation snapshot without owning API or realtime mechanics. */
export const AgentOSSolutionModuleDetailBase = ({ detailState, installation, labels, onBack }: AgentOSSolutionModuleDetailViewProps) => {
    // A refusal and a missing installation are the same page: there is nothing to lay out, so the
    // stack carries the one notice rather than two empty cards.
    const settledSections = detailState === "refused" || installation === undefined
        ? [defineContractProjection("label-row-over-card", () => <EmptyNotice props={{ message: labels.refused }} />)]
        : [
            defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleSummary state="ready" installation={installation} labels={labels.summary} />),
            defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleBindings state="ready" installation={installation} labels={labels.bindings} />),
        ]
    const sections = detailState === "loading"
        ? [
            defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleSummary state="pending" labels={labels.summary} />),
            defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleBindings state="pending" labels={labels.bindings} />),
        ]
        : settledSections
    return (
        <Tree
            contract="module-detail-page"
            render={defineContractComponent("module-detail-page", {
                back: defineLeafComponent("text-link", {}, () => <TextLink props={{ label: labels.backToWorkspace, size: "sm" }} on={{ press: onBack }} />),
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: labels.title, level: 1 }} />),
                }),
                lede: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: detailState === "loading" ? labels.loading : installation?.moduleKey ?? labels.title, size: "sm", tone: "muted" }} />),
                section: sections,
            })}
        />
    )
}

/** Source-level tier marker for the pure module detail block. */
export const meta = { shape: "block", world: "pure" } as const
