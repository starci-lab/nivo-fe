import { CONTENT_CLASS_NAME } from "./classNames";
import type { AgentWorkspaceControlCenter } from "@/modules/api/console";
import { Progress as DirectionProgress, SurfaceCard, Text } from "@starci/grammar/common";
/** Runtime snapshot and resolved copy consumed by the metrics block. */
export type AgentOSWorkspaceRuntimeProps = {
    readonly data: AgentWorkspaceControlCenter;
    readonly labels: {
        readonly section: string;
        readonly cpu: string;
        readonly memory: string;
        readonly requests: string;
        readonly limits: string;
        readonly restarts: string;
        readonly health: string;
        readonly fresh: string;
        readonly stale: string;
        readonly unavailable: string;
    };
    readonly formatDate: (value: string) => string;
};
const percentage = (usage: number | null, limit: number): number => usage === null || limit <= 0 ? 0 : Math.min(100, Math.round(usage / limit * 100));
const mib = (bytes: number): string => `${Math.round(bytes / 1024 / 1024)} MiB`;
const fact = (label: string, value: string) => <Text size="sm">{label}: {value}</Text>;
/** Draw measured usage without presenting allocation or a missing metric as current usage. */
export const AgentOSWorkspaceRuntime = (props: AgentOSWorkspaceRuntimeProps) => {
    const { data, labels, formatDate }: AgentOSWorkspaceRuntimeProps = props;
    const runtime = data.runtime;
    const totals = runtime?.totals;
    const cpuText = totals?.cpuUsageMillicores === null || totals === undefined ? labels.unavailable : `${Math.round(totals.cpuUsageMillicores)}m / ${Math.round(totals.cpuLimitMillicores)}m`;
    const memoryText = totals?.memoryUsageBytes === null || totals === undefined ? labels.unavailable : `${mib(totals.memoryUsageBytes)} / ${mib(totals.memoryLimitBytes)}`;
    const freshness = runtime?.stale === true ? labels.stale : labels.fresh;
    const note = runtime === null ? labels.unavailable : `${freshness} · ${formatDate(runtime.observedAt)}`;
    return <SurfaceCard label={labels.section}><div className={CONTENT_CLASS_NAME} data-contract="GAP-2"><div><Text size="sm">{labels.cpu}: {cpuText}</Text>{totals?.cpuUsageMillicores != null && totals.cpuLimitMillicores > 0 ? <DirectionProgress label={labels.cpu} value={percentage(totals.cpuUsageMillicores, totals.cpuLimitMillicores)}/> : null}</div><div><Text size="sm">{labels.memory}: {memoryText}</Text>{totals?.memoryUsageBytes != null && totals.memoryLimitBytes > 0 ? <DirectionProgress label={labels.memory} value={percentage(totals.memoryUsageBytes, totals.memoryLimitBytes)}/> : null}</div>{fact(labels.requests, totals === undefined ? "—" : Math.round(totals.cpuRequestMillicores) + "m · " + mib(totals.memoryRequestBytes))}{fact(labels.limits, totals === undefined ? "—" : Math.round(totals.cpuLimitMillicores) + "m · " + mib(totals.memoryLimitBytes))}{fact(labels.restarts, totals?.restartCount == null ? labels.unavailable : String(totals.restartCount))}{fact(labels.health, runtime?.probeStatus ?? labels.unavailable)}<Text size="sm" tone="muted">{note}</Text></div></SurfaceCard>;
};
