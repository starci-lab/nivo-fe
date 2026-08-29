import { Badge, SurfaceCard, Text, TextLink, TileIcon, type BadgeTone } from "@nivo/ui";
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice";
import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow";
/** Public API role for AgentOSWorkspaceListProps. */
export type AgentOSWorkspaceListProps = AgentOSWorkspaceListViewProps;
const STATUS_TONE: Readonly<Record<FleetStatus, BadgeTone>> = {
  not_provisioned: "neutral",
  provisioning: "accent",
  awaiting_dns: "warning",
  ready: "success",
  failed: "danger",
  active: "success",
  suspended: "neutral"
};

/** One resolved AgentOS management row. */
export type AgentOSWorkspaceView = {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly kindLabel: string;
  readonly status: FleetStatus;
  readonly statusLabel: string;
};

/** Copy for the three measured dashboard signals. */
export type AgentOSWorkspaceSummaryLabels = {
  readonly workspaces: string;
  readonly workspacesCaption: string;
  readonly running: string;
  readonly runningCaption: string;
  readonly attention: string;
  readonly attentionCaption: string;
};
type AgentOSWorkspaceListCommonProps = {
  readonly label: string;
  readonly summary?: AgentOSWorkspaceSummaryLabels;
};

/** Every settled state of the independently connected AgentOS workspace list. */
export type AgentOSWorkspaceListViewProps = {
  readonly state: "resting";
  readonly props: AgentOSWorkspaceListCommonProps;
} | {
  readonly state: "empty";
  readonly props: AgentOSWorkspaceListCommonProps & {
    readonly message: string;
    readonly actionLabel: string;
  };
  readonly on: {
    readonly create: () => void;
  };
} | {
  readonly state: "refused";
  readonly props: AgentOSWorkspaceListCommonProps & {
    readonly message: string;
  };
} | {
  readonly state: "answered";
  readonly props: AgentOSWorkspaceListCommonProps & {
    readonly rows: ReadonlyArray<AgentOSWorkspaceView>;
  };
  readonly on: {
    readonly openWorkspace: (id: string) => void;
  };
};
const workspaceRow = (row: AgentOSWorkspaceView, isLoading: boolean, openWorkspace?: (id: string) => void) => <div><div>





    <TextLink props={{
      label: row.name,
      size: "sm"
    }} on={{
      press: openWorkspace === undefined ? undefined : () => openWorkspace(row.id)
    }} />



    <Text props={{
      content: row.detail,
      size: "xs",
      tone: "muted"
    }} isLoading={isLoading} /></div>



  <Badge props={{
    content: row.kindLabel,
    tone: "neutral"
  }} isLoading={isLoading} />


  <Badge props={{
    content: row.statusLabel,
    tone: STATUS_TONE[row.status]
  }} isLoading={isLoading} /></div>;

/** Draw the workspace collection without owning its query or dashboard route. */
export const AgentOSWorkspaceListBase = (props: AgentOSWorkspaceListProps) => {
  const { state } = props;
  const common = props.props;
  const rows = state === "answered" ? props.props.rows : [];
  const isLoading = state === "resting";
  const isRefused = state === "refused";
  const summaryLabels = common.summary ?? {
    workspaces: common.label,
    workspacesCaption: "",
    running: common.label,
    runningCaption: "",
    attention: common.label,
    attentionCaption: ""
  };
  const runningCount = rows.filter(row => row.status === "ready" || row.status === "active").length;
  const attentionCount = rows.filter(row => row.status === "failed" || row.status === "suspended" || row.status === "awaiting_dns").length;
  const totals = [{
    id: "workspaces",
    icon: "agentos" as const,
    label: summaryLabels.workspaces,
    value: rows.length,
    caption: summaryLabels.workspacesCaption,
    signal: "none" as const
  }, {
    id: "running",
    icon: "complete" as const,
    label: summaryLabels.running,
    value: runningCount,
    caption: summaryLabels.runningCaption,
    signal: "active" as const
  }, {
    id: "attention",
    icon: "notification" as const,
    label: summaryLabels.attention,
    value: attentionCount,
    caption: summaryLabels.attentionCaption,
    signal: attentionCount > 0 ? "attention" as const : "none" as const
  }];
  const summary = <div>{totals.map((total, index) => <SurfaceCard key={index} isLoading={isLoading}><div>{<div>{<TileIcon props={{
            icon: total.icon,
            signal: total.signal
          }} isLoading={isLoading} />}{<Text props={{
            content: total.label,
            size: "sm",
            weight: "medium"
          }} />}</div>}{<Text props={{
          content: isRefused ? "—" : String(total.value),
          size: "metric-lead",
          weight: "semibold"
        }} isLoading={isLoading} />}{<Text props={{
          content: total.caption,
          size: "xs",
          tone: "muted"
        }} />}</div></SurfaceCard>)}</div>;
  const collection = (() => {
    if (state === "empty" || state === "refused") {
      return <SurfaceCard props={{
        label: common.label
      }}><div>



            <EmptyNotice props={{
            message: props.props.message,
            actionLabel: state === "empty" ? props.props.actionLabel : undefined
          }} on={{
            act: state === "empty" ? props.on.create : undefined
          }} /></div></SurfaceCard>;
    }
    const openWorkspace = state === "answered" ? props.on.openWorkspace : undefined;
    return <SurfaceCard props={{
      label: common.label
    }} isLoading={state === "resting"}><div>{state === "resting" ? [workspaceRow({
          id: "agentos-resting",
          name: "",
          detail: "",
          kindLabel: "",
          status: "provisioning",
          statusLabel: ""
        }, true)] : rows.map(row => workspaceRow(row, false, openWorkspace))}</div></SurfaceCard>;
  })();
  return <div>{summary}{collection}</div>;
};

