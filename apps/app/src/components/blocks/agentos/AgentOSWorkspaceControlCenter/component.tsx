import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter";
import { AgentOSWorkspaceAiKnowledge } from "@/components/blocks/agentos/AgentOSWorkspaceAiKnowledge";
import { AgentOSWorkspaceApplications } from "@/components/blocks/agentos/AgentOSWorkspaceApplications";
import { AgentOSWorkspaceRuntime } from "@/components/blocks/agentos/AgentOSWorkspaceRuntime";
import { AgentOSWorkspaceSummary } from "@/components/blocks/agentos/AgentOSWorkspaceSummary";
import { AgentOSWorkspaceOperations } from "@/components/blocks/operations/AgentOSWorkspaceOperations";
import { HelmStackSnapshot } from "@/components/blocks/operations/HelmStackSnapshot";
import type { AgentWorkspaceControlCenter } from "@/modules/api/console";
import { SectionHeader as DirectionHeader, PrimaryRailLayout as DirectionLayout, PageContainer as DirectionPage, Tabs as DirectionTabs, EmptyNotice, SurfaceCard, Text } from "@starci/grammar/common";
/** Page-level compositions available inside one workspace control center. */
export type AgentOSWorkspaceControlCenterProps = AgentOSWorkspaceControlCenterViewProps;
/** Public API role for AgentOSWorkspacePageState. */
export type AgentOSWorkspacePageState = "overview" | "solutions" | "ai-knowledge" | "applications" | "infrastructure" | "operations" | "access";
/** Request-owned situations for the workspace control-center aggregate. */
export type AgentOSWorkspaceControlCenterState = "loading" | "refused" | "ready";
/** Fully resolved bilingual copy passed into the pure workspace page. */
export type AgentOSWorkspaceControlCenterLabels = {
    readonly titleFallback: string;
    readonly eyebrow?: string;
    readonly description?: string;
    readonly stateSection?: string;
    readonly readyStatus?: string;
    readonly loadingTitle?: string;
    readonly refusedTitle?: string;
    readonly retry?: string;
    readonly loading: string;
    readonly accessUnavailable: string;
    readonly tabsLabel: string;
    readonly tabs: ReadonlyArray<{
        readonly id: AgentOSWorkspacePageState;
        readonly label: string;
    }>;
    readonly summary: Parameters<typeof AgentOSWorkspaceSummary>[0]["labels"];
    readonly applications: Parameters<typeof AgentOSWorkspaceApplications>[0]["labels"];
    readonly runtime: Parameters<typeof AgentOSWorkspaceRuntime>[0]["labels"];
    readonly stack: Parameters<typeof HelmStackSnapshot>[0]["labels"];
    readonly operations: Parameters<typeof AgentOSWorkspaceOperations>[0]["labels"];
};
/** Settled view state consumed by the pure workspace page twin. */
export type AgentOSWorkspaceControlCenterViewProps = {
    readonly workspaceId?: string;
    readonly pageState: AgentOSWorkspacePageState;
    readonly controlCenterState: AgentOSWorkspaceControlCenterState;
    readonly message?: string;
    readonly data?: AgentWorkspaceControlCenter;
    readonly labels: AgentOSWorkspaceControlCenterLabels;
    readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void;
    readonly onOpenAgentConsole: () => void;
    readonly onRetry?: () => void;
    readonly retryPending?: boolean;
    readonly openClawLaunchHref: string;
    readonly launchState: Parameters<typeof AgentOSWorkspaceApplications>[0]["launchState"];
    readonly formatDate: (value: string) => string;
};
/** Compose one AgentOS workspace from domain blocks; the page owns no API or operational JSX. */
export const AgentOSWorkspaceControlCenterBase = (props: AgentOSWorkspaceControlCenterProps) => {
    const { workspaceId, pageState, controlCenterState, message, data, labels, launchState, openClawLaunchHref, onSelectPageState, onOpenAgentConsole, onRetry, retryPending, formatDate }: AgentOSWorkspaceControlCenterViewProps = props;
    const title = data?.workspace.name ?? workspaceId ?? labels.titleFallback;
    const pageCopy = {
        eyebrow: labels.eyebrow ?? labels.titleFallback,
        description: labels.description ?? labels.accessUnavailable,
        stateSection: labels.stateSection ?? labels.titleFallback,
        readyStatus: labels.readyStatus ?? "Ready",
        loadingTitle: labels.loadingTitle ?? labels.loading,
        refusedTitle: labels.refusedTitle ?? labels.titleFallback,
        retry: labels.retry ?? "Retry"
    };
    /** One tab decides one list of projections; an unsettled page shows the notice instead. */
    const sectionsOf = () => {
        if (controlCenterState !== "ready" || data === undefined) {
            const isRefused = controlCenterState === "refused";
            return [isRefused ? <EmptyNotice key="state" message={message ?? pageCopy.refusedTitle} actionLabel={pageCopy.retry} onAction={onRetry} isActionPending={retryPending}/> : <SurfaceCard key="state" label={pageCopy.stateSection}><Text isSkeleton>{pageCopy.loadingTitle}</Text></SurfaceCard>];
        }
        if (pageState === "overview") {
            return [<DirectionLayout key="overview" primary={<div className="flex min-w-0 flex-col gap-6" data-contract="GAP-5"><AgentOSWorkspaceSummary data={data} labels={labels.summary}/><AgentOSSolutionModuleCenter workspaceId={data.workspace.id}/><AgentOSWorkspaceApplications apps={data.apps} labels={labels.applications} launchState={launchState} openClawLaunchHref={openClawLaunchHref} onManageOpenClaw={onOpenAgentConsole}/></div>} rail={<AgentOSWorkspaceRuntime data={data} labels={labels.runtime} formatDate={formatDate}/>} railWidth="standard" align="start"/>];
        }
        if (pageState === "applications") {
            return [<AgentOSWorkspaceApplications key="item-0" apps={data.apps} labels={labels.applications} launchState={launchState} openClawLaunchHref={openClawLaunchHref} onManageOpenClaw={onOpenAgentConsole}/>];
        }
        if (pageState === "solutions") {
            return [<AgentOSSolutionModuleCenter key="item-0" workspaceId={data.workspace.id}/>];
        }
        if (pageState === "ai-knowledge") {
            return [<AgentOSWorkspaceAiKnowledge key="item-0" workspaceId={data.workspace.id}/>];
        }
        if (pageState === "access") {
            return [<EmptyNotice key="item-0" message={labels.accessUnavailable}/>];
        }
        if (pageState === "infrastructure") {
            return [<DirectionLayout key="infrastructure" primary={<AgentOSWorkspaceRuntime data={data} labels={labels.runtime} formatDate={formatDate}/>} rail={<HelmStackSnapshot runtime={data.runtime} labels={labels.stack}/>} align="start"/>];
        }
        return [<AgentOSWorkspaceOperations key="item-0" labels={labels.operations}/>];
    };
    const sections = sectionsOf();
    const tabs = controlCenterState === "ready" ? <DirectionTabs label={labels.tabsLabel} selectedKey={pageState} items={labels.tabs} onSelect={key => onSelectPageState(key as AgentOSWorkspacePageState)} panelId={key => "workspace-panel-" + key} labelVisibility="always" inset="none"/> : null;
    return <DirectionPage measure="product"><div className="flex min-w-0 flex-col gap-2" data-contract="GAP-2"><DirectionHeader level={1} eyebrow={pageCopy.eyebrow} title={title} description={<Text size="md" tone="muted">{pageCopy.description}</Text>}/>{tabs}<section role="tabpanel" id={"workspace-panel-" + pageState} aria-label={labels.tabs.find(tab => tab.id === pageState)?.label}><div className="flex min-w-0 flex-col gap-6" data-contract="GAP-5">{sections}</div></section></div></DirectionPage>;
};
