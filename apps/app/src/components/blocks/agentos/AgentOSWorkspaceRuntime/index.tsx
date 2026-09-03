import { LabelledProgressRow } from "@nivo/ui";
import { SurfaceCard, Text } from "@starci/grammar/core";
import type { AgentWorkspaceControlCenter } from "@/modules/api/console";

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
const fact = (label: string, value: string) => <div>
  <Text size="sm">{label}</Text>
  <Text size="sm">{value}</Text></div>;

/** Draw measured usage without presenting allocation or a missing metric as current usage. */
export const AgentOSWorkspaceRuntime = (props: AgentOSWorkspaceRuntimeProps) => {
  const {
    data,
    labels,
    formatDate
  }: AgentOSWorkspaceRuntimeProps = props;
  const runtime = data.runtime;
  const totals = runtime?.totals;
  const cpuText = totals?.cpuUsageMillicores === null || totals === undefined ? labels.unavailable : `${Math.round(totals.cpuUsageMillicores)}m / ${Math.round(totals.cpuLimitMillicores)}m`;
  const memoryText = totals?.memoryUsageBytes === null || totals === undefined ? labels.unavailable : `${mib(totals.memoryUsageBytes)} / ${mib(totals.memoryLimitBytes)}`;
  const freshness = runtime?.stale === true ? labels.stale : labels.fresh;
  const note = runtime === null ? labels.unavailable : `${freshness} · ${formatDate(runtime.observedAt)}`;
  return <SurfaceCard
    label={labels.section}
  ><div><>




          <LabelledProgressRow props={{
          id: "cpu",
          title: labels.cpu,
          percent: percentage(totals?.cpuUsageMillicores ?? null, totals?.cpuLimitMillicores ?? 0),
          percentText: cpuText
        }} />


          <LabelledProgressRow props={{
          id: "memory",
          title: labels.memory,
          percent: percentage(totals?.memoryUsageBytes ?? null, totals?.memoryLimitBytes ?? 0),
          percentText: memoryText
        }} /></><div><>{fact(labels.requests, totals === undefined ? "—" : `${Math.round(totals.cpuRequestMillicores)}m · ${mib(totals.memoryRequestBytes)}`)}{fact(labels.limits, totals === undefined ? "—" : `${Math.round(totals.cpuLimitMillicores)}m · ${mib(totals.memoryLimitBytes)}`)}{fact(labels.restarts, String(totals?.restartCount ?? 0))}{fact(labels.health, runtime?.probeStatus ?? "unavailable")}</></div>


        <Text size="sm" tone="muted">{note}</Text></div></SurfaceCard>;
};
