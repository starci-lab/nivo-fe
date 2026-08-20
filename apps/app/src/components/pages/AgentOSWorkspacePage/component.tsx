import {
    ChoiceTabs,
    Heading,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import { AgentOSWorkspaceApplications } from "@/components/blocks/agentos/AgentOSWorkspaceApplications"
import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter"
import { AgentOSWorkspaceRuntime } from "@/components/blocks/agentos/AgentOSWorkspaceRuntime"
import { AgentOSWorkspaceSummary } from "@/components/blocks/agentos/AgentOSWorkspaceSummary"
import { AgentOSWorkspaceOperations } from "@/components/blocks/operations/AgentOSWorkspaceOperations"
import { HelmStackSnapshot } from "@/components/blocks/operations/HelmStackSnapshot"
import type { AgentWorkspaceControlCenter } from "@/modules/api/console"

/** Peer sections available inside one workspace control center. */
export type AgentOSWorkspaceSection = "overview" | "solutions" | "applications" | "infrastructure" | "operations" | "access"

/** Fully resolved bilingual copy passed into the pure workspace page. */
export type AgentOSWorkspacePageLabels = {
    readonly titleFallback: string
    readonly loading: string
    readonly tabsLabel: string
    readonly tabs: ReadonlyArray<{ readonly id: AgentOSWorkspaceSection; readonly label: string }>
    readonly summary: Parameters<typeof AgentOSWorkspaceSummary>[0]["labels"]
    readonly applications: Parameters<typeof AgentOSWorkspaceApplications>[0]["labels"]
    readonly runtime: Parameters<typeof AgentOSWorkspaceRuntime>[0]["labels"]
    readonly stack: Parameters<typeof HelmStackSnapshot>[0]["labels"]
    readonly operations: Parameters<typeof AgentOSWorkspaceOperations>[0]["labels"]
}

/** Settled view state consumed by the pure workspace page twin. */
export type AgentOSWorkspacePageViewProps = {
    readonly state: "loading" | "refused" | "ready"
    readonly message?: string
    readonly data?: AgentWorkspaceControlCenter
    readonly section: AgentOSWorkspaceSection
    readonly labels: AgentOSWorkspacePageLabels
    readonly onSelectSection: (section: AgentOSWorkspaceSection) => void
    readonly onOpenAgentConsole: () => void
    readonly openClawLaunchHref: string
    readonly launchState: Parameters<typeof AgentOSWorkspaceApplications>[0]["launchState"]
    readonly formatDate: (value: string) => string
}

/** Compose one AgentOS workspace from domain blocks; the page owns no API or operational JSX. */
export const AgentOSWorkspacePageBase = ({ state, message, data, section, labels, launchState, openClawLaunchHref, onSelectSection, onOpenAgentConsole, formatDate }: AgentOSWorkspacePageViewProps) => {
    const title = data?.workspace.name ?? labels.titleFallback
    /** One tab decides one list of projections; an unsettled page shows the notice instead. */
    const sectionsOf = () => {
        if (state !== "ready" || data === undefined) {
            return [defineContractProjection("label-row-over-card", () => <EmptyNotice props={{ message: message ?? labels.loading }} />)]
        }
        if (section === "overview") {
            const overviewSections = [
                defineContractProjection("label-row-over-card", () => <AgentOSWorkspaceSummary data={data} labels={labels.summary} />),
                defineContractProjection("label-row-over-card", () => <AgentOSWorkspaceRuntime data={data} labels={labels.runtime} formatDate={formatDate} />),
            ]
            return [defineContractProjection("workspace-overview-grid", () => (
                <Tree
                    contract="workspace-overview-grid"
                    render={defineContractComponent("workspace-overview-grid", { section: overviewSections })}
                />
            ))]
        }
        if (section === "applications" || section === "access") {
            return [defineContractProjection("label-row-over-card", () => (
                <AgentOSWorkspaceApplications
                    apps={data.apps}
                    labels={labels.applications}
                    launchState={launchState}
                    openClawLaunchHref={openClawLaunchHref}
                    onManageOpenClaw={onOpenAgentConsole}
                />
            ))]
        }
        if (section === "solutions") {
            return [defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleCenter workspaceId={data.workspace.id} />)]
        }
        if (section === "infrastructure") {
            return [
                defineContractProjection("label-row-over-card", () => <AgentOSWorkspaceRuntime data={data} labels={labels.runtime} formatDate={formatDate} />),
                defineContractProjection("label-row-over-card", () => <HelmStackSnapshot runtime={data.runtime} labels={labels.stack} />),
            ]
        }
        return [defineContractProjection("label-row-over-card", () => <AgentOSWorkspaceOperations labels={labels.operations} />)]
    }
    const sections = sectionsOf()
    return (
        <Tree
            contract="tabbed-control-center-page"
            render={defineContractComponent("tabbed-control-center-page", {
                heading: defineContractComponent("title-with-end-action", {
                    title: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 1 }} />),
                }),
                tabs: defineLeafComponent("choice-tabs", {}, () => (
                    <ChoiceTabs props={{ label: labels.tabsLabel, selectedKey: section, tabs: labels.tabs, variant: "primary" }} on={{ select: (key) => onSelectSection(key as AgentOSWorkspaceSection) }} />
                )),
                section: sections,
            })}
        />
    )
}

/** Source-level tier marker for the pure workspace page twin. */
export const meta = { shape: "page", world: "pure" } as const
