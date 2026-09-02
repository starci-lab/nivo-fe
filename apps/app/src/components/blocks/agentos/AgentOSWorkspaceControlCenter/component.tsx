import { ChoiceTabs, TileIcon } from "@nivo/ui";
import { SurfaceCard, Button, EmptyNotice, Heading, Text } from "@starci/grammar/common";
import { AgentOSWorkspaceApplications } from "@/components/blocks/agentos/AgentOSWorkspaceApplications";
import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter";
import { AgentOSWorkspaceAiKnowledge } from "@/components/blocks/agentos/AgentOSWorkspaceAiKnowledge";
import { AgentOSWorkspaceRuntime } from "@/components/blocks/agentos/AgentOSWorkspaceRuntime";
import { AgentOSWorkspaceSummary } from "@/components/blocks/agentos/AgentOSWorkspaceSummary";
import { AgentOSWorkspaceOperations } from "@/components/blocks/operations/AgentOSWorkspaceOperations";
import { HelmStackSnapshot } from "@/components/blocks/operations/HelmStackSnapshot";
import type { AgentWorkspaceControlCenter } from "@/modules/api/console";

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
  readonly openClawLaunchHref: string;
  readonly launchState: Parameters<typeof AgentOSWorkspaceApplications>[0]["launchState"];
  readonly formatDate: (value: string) => string;
};
const workspaceSignal = (state: AgentOSWorkspaceControlCenterState) => {
  if (state === "refused") return "attention";
  return state === "ready" ? "active" : "none";
};

/** Compose one AgentOS workspace from domain blocks; the page owns no API or operational JSX. */
export const AgentOSWorkspaceControlCenterBase = (props: AgentOSWorkspaceControlCenterProps) => {
  const {
    workspaceId,
    pageState,
    controlCenterState,
    message,
    data,
    labels,
    launchState,
    openClawLaunchHref,
    onSelectPageState,
    onOpenAgentConsole,
    onRetry,
    formatDate
  }: AgentOSWorkspaceControlCenterViewProps = props;
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
      return [<SurfaceCard
        key="item-0"
        label={pageCopy.stateSection}
      ><div>



          <TileIcon props={{
            icon: isRefused ? "retry" : "agentos",
            signal: isRefused ? "attention" : "none"
          }} isLoading={!isRefused} /><div>



            <Heading level={2}>{isRefused ? pageCopy.refusedTitle : pageCopy.loadingTitle}</Heading>


            <Text size="md" tone="muted">{message ?? labels.loading}</Text>
            {isRefused ? <Button
              variant="primary"
              onPress={onRetry}
            >{pageCopy.retry}</Button> : null}</div></div></SurfaceCard>];
    }
    if (pageState === "overview") {
      const overviewSections = [<AgentOSWorkspaceSummary key="item-0" data={data} labels={labels.summary} />, <AgentOSWorkspaceRuntime key="item-1" data={data} labels={labels.runtime} formatDate={formatDate} />];
      return [<div key="item-0">{overviewSections}</div>, <AgentOSSolutionModuleCenter key="item-1" workspaceId={data.workspace.id} />, <AgentOSWorkspaceApplications key="item-2" apps={data.apps} labels={labels.applications} launchState={launchState} openClawLaunchHref={openClawLaunchHref} onManageOpenClaw={onOpenAgentConsole} />];
    }
    if (pageState === "applications") {
      return [<AgentOSWorkspaceApplications key="item-0" apps={data.apps} labels={labels.applications} launchState={launchState} openClawLaunchHref={openClawLaunchHref} onManageOpenClaw={onOpenAgentConsole} />];
    }
    if (pageState === "solutions") {
      return [<AgentOSSolutionModuleCenter key="item-0" workspaceId={data.workspace.id} />];
    }
    if (pageState === "ai-knowledge") {
      return [<AgentOSWorkspaceAiKnowledge key="item-0" workspaceId={data.workspace.id} />];
    }
    if (pageState === "access") {
      return [<EmptyNotice key="item-0" message={labels.accessUnavailable} />];
    }
    if (pageState === "infrastructure") {
      return [<AgentOSWorkspaceRuntime key="item-0" data={data} labels={labels.runtime} formatDate={formatDate} />, <HelmStackSnapshot key="item-1" runtime={data.runtime} labels={labels.stack} />];
    }
    return [<AgentOSWorkspaceOperations key="item-0" labels={labels.operations} />];
  };
  const sections = sectionsOf();
  const tabs = controlCenterState === "ready" ? <ChoiceTabs props={{
    label: labels.tabsLabel,
    selectedKey: pageState,
    tabs: labels.tabs,
    variant: "primary"
  }} on={{
    select: key => onSelectPageState(key as AgentOSWorkspacePageState)
  }} /> : null;
  return <div><div><div>






        <TileIcon props={{
          icon: "agentos",
          signal: workspaceSignal(controlCenterState)
        }} isLoading={controlCenterState === "loading"} /><div>



          <Text size="sm" tone="accent" weight="semibold">{pageCopy.eyebrow}</Text>


          <Heading level={1} scale="display">{title}</Heading>


          <Text size="md" tone="muted">{pageCopy.description}</Text></div></div></div>{tabs}{sections}</div>;
};

