import { type FleetStatus } from "@/components/blocks/provisioning/FleetRow";
import { Badge, type BadgeTone, SectionHeader as DirectionHeader, PrimaryRailLayout as DirectionLayout, SurfaceListCard as DirectionList, EmptyNotice, SurfaceCard, Text, TextAction } from "@starci/grammar/common";
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
    readonly href: string;
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
/** Draw the workspace collection without owning its query or dashboard route. */
export const AgentOSWorkspaceListBase = (props: AgentOSWorkspaceListProps) => {
    const { state } = props;
    const common = props.props;
    const loading = state === "resting";
    const rows = state === "answered" ? props.props.rows : [];
    const labels = common.summary;
    const collection = state === "empty" || state === "refused" ? <EmptyNotice message={props.props.message} actionLabel={state === "empty" ? props.props.actionLabel : undefined} onAction={state === "empty" ? props.on.create : undefined}/> :
        <DirectionList label={common.label} isLoading={loading}>{loading ? <div className="border-b border-separator px-4 py-3 last:border-b-0" data-contract="BOUNDARY-2 PADDING-4 PADDING-3"><Text isSkeleton>{common.label}</Text></div> : rows.map(row => <div key={row.id} className="border-b border-separator px-4 py-3 last:border-b-0" data-contract="BOUNDARY-2 PADDING-4 PADDING-3"><DirectionHeader level={2} title={<TextAction href={row.href} onFollow={props.state === "answered" ? () => props.on.openWorkspace(row.id) : undefined}>{row.name}</TextAction>} description={<><Text size="xs" tone="muted">{row.detail}</Text><Text size="xs" tone="muted">{row.kindLabel}</Text></>} action={<Badge tone={STATUS_TONE[row.status]}>{row.statusLabel}</Badge>}/></div>)}</DirectionList>;
    const summary = labels === undefined ? undefined : <SurfaceCard label={labels.workspaces}><div className="flex min-w-0 flex-col gap-2" data-contract="GAP-2"><Text size="sm" isSkeleton={loading}>{labels.workspaces}: {state === "refused" ? "—" : rows.length}</Text><Text size="sm" isSkeleton={loading}>{labels.running}: {state === "refused" ? "—" : rows.filter(row => row.status === "ready" || row.status === "active").length}</Text><Text size="sm" isSkeleton={loading}>{labels.attention}: {state === "refused" ? "—" : rows.filter(row => ["failed", "suspended", "awaiting_dns"].includes(row.status)).length}</Text></div></SurfaceCard>;
    return <DirectionLayout primary={collection} rail={summary} railWidth="compact" align="start" collapsedOrder="primary-first"/>;
};
