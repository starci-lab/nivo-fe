import { ACTIONS_CLASS_NAME, DASHBOARD_CLASS_NAME, GROUP_LABEL_CLASS_NAME, IDENTITY_CLASS_NAME, ROW_CLASS_NAME, SUMMARY_CELL_CLASS_NAME, SUMMARY_GRID_CLASS_NAME } from "./classNames";
import { type FleetStatus } from "@/components/blocks/provisioning/FleetRow";
import { Badge, type BadgeTone, Button, SurfaceListCard as DirectionList, EmptyNotice, SurfaceCard, Text, TextAction } from "@starci/grammar/common";
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
    readonly overview: string;
    readonly workspaces: string;
    readonly workspacesCaption: string;
    readonly running: string;
    readonly runningCaption: string;
    readonly attention: string;
    readonly attentionCaption: string;
    readonly attentionGroup: string;
    readonly steadyGroup: string;
    readonly manage: string;
    readonly retry: string;
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
    readonly on: {
        readonly retry: () => void;
        readonly isRetrying?: boolean;
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
const ATTENTION_STATUSES: ReadonlySet<FleetStatus> = new Set(["failed", "suspended", "awaiting_dns"]);
const isRunning = (status: FleetStatus) => status === "ready" || status === "active";
const summaryValue = (state: AgentOSWorkspaceListProps["state"], value: number) => state === "refused" ? "—" : String(value);
const summaryCell = (label: string, caption: string, value: string, loading: boolean, tone: "default" | "accent" = "default") => <div className={SUMMARY_CELL_CLASS_NAME} data-contract="GAP-2 PADDING-4 PADDING-3">
    <Text size="xs" tone="muted" isSkeleton={loading}>{label}</Text>
    <Text size="metric-lead" weight="semibold" tone={tone} isSkeleton={loading}>{value}</Text>
    <Text size="xs" tone="muted" isSkeleton={loading}>{caption}</Text>
</div>;
const workspaceRow = (row: AgentOSWorkspaceView, manage: string, onOpen: (id: string) => void) => <div key={row.id} className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3">
    <div className={IDENTITY_CLASS_NAME}>
        <TextAction href={row.href} size="sm" onFollow={() => onOpen(row.id)}>{row.name}</TextAction>
        <Text size="xs" tone="muted" overflow="wrap">{row.detail}</Text>
    </div>
    <div className={ACTIONS_CLASS_NAME}>
        <Badge tone="neutral">{row.kindLabel}</Badge>
        <Badge tone={STATUS_TONE[row.status]}>{row.statusLabel}</Badge>
        <Button href={row.href} size="sm" variant={ATTENTION_STATUSES.has(row.status) ? "primary" : "secondary"} onFollow={() => onOpen(row.id)}>{manage}</Button>
    </div>
</div>;
const restingRow = (index: number, label: string, actionLabel: string) => <div key={`resting-${index}`} className={ROW_CLASS_NAME} data-contract="BOUNDARY-2 PADDING-4 PADDING-3">
    <div className={IDENTITY_CLASS_NAME}>
        <Text size="sm" isSkeleton>{label}</Text>
        <Text size="xs" isSkeleton>{label}</Text>
    </div>
    <div className={ACTIONS_CLASS_NAME}>
        <Badge tone="neutral" isSkeleton>Status</Badge>
        <Button size="sm" variant="secondary" isSkeleton>{actionLabel}</Button>
    </div>
</div>;
const groupedRows = (rows: ReadonlyArray<AgentOSWorkspaceView>, labels: AgentOSWorkspaceSummaryLabels, onOpen: (id: string) => void) => {
    const attention = rows.filter(row => ATTENTION_STATUSES.has(row.status));
    const steady = rows.filter(row => !ATTENTION_STATUSES.has(row.status));
    const group = (label: string, members: ReadonlyArray<AgentOSWorkspaceView>) => members.length === 0 ? null : <section key={label} aria-label={label}>
        <div className={GROUP_LABEL_CLASS_NAME}><Text size="sm" weight="semibold">{label}</Text></div>
        {members.map(row => workspaceRow(row, labels.manage, onOpen))}
    </section>;
    return <>{group(labels.attentionGroup, attention)}{group(labels.steadyGroup, steady)}</>;
};
/** Draw the workspace collection without owning its query or dashboard route. */
export const AgentOSWorkspaceListBase = (props: AgentOSWorkspaceListProps) => {
    const { state } = props;
    const common = props.props;
    const loading = state === "resting";
    const rows = state === "answered" ? props.props.rows : [];
    const labels = common.summary;
    const attentionCount = rows.filter(row => ATTENTION_STATUSES.has(row.status)).length;
    const summary = labels === undefined ? null : <SurfaceCard label={labels.overview} composition="joined">
        <div className={SUMMARY_GRID_CLASS_NAME} aria-busy={loading || undefined} aria-live="polite">
            {summaryCell(labels.workspaces, labels.workspacesCaption, summaryValue(state, rows.length), loading)}
            {summaryCell(labels.running, labels.runningCaption, summaryValue(state, rows.filter(row => isRunning(row.status)).length), loading, "accent")}
            {summaryCell(labels.attention, labels.attentionCaption, summaryValue(state, attentionCount), loading, attentionCount > 0 ? "accent" : "default")}
        </div>
    </SurfaceCard>;
    let collection;
    if (state === "empty") {
        collection = <SurfaceCard label={common.label}><EmptyNotice message={props.props.message} actionLabel={props.props.actionLabel} actionVariant="primary" onAction={props.on.create}/></SurfaceCard>;
    } else if (state === "refused") {
        collection = <SurfaceCard label={common.label}><div role="alert"><EmptyNotice message={props.props.message} actionLabel={labels?.retry} isActionPending={props.on.isRetrying} onAction={props.on.retry}/></div></SurfaceCard>;
    } else {
        collection = <DirectionList label={common.label} labelHidden isLoading={loading} isVerdict>
            {loading ? [restingRow(1, common.label, labels?.manage ?? common.label), restingRow(2, common.label, labels?.manage ?? common.label), restingRow(3, common.label, labels?.manage ?? common.label)] : labels === undefined ? null : groupedRows(rows, labels, props.on.openWorkspace)}
        </DirectionList>;
    }
    return <div className={DASHBOARD_CLASS_NAME} aria-busy={loading || undefined}>{summary}{collection}</div>;
};
