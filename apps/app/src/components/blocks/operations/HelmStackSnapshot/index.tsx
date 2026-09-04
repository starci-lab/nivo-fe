import type { AgentWorkspaceRuntime } from "@/modules/api/console";
import { HelmComponentStatusTable } from "@nivo/ui";
import { HorizontalScrollRegion as DirectionScroll, EmptyNotice, SurfaceCard } from "@starci/grammar/common";
/** Public-safe Helm snapshot and resolved labels consumed by the stack block. */
export type HelmStackSnapshotProps = {
    readonly runtime: AgentWorkspaceRuntime | null;
    readonly labels: {
        readonly section: string;
        readonly unavailable: string;
        readonly release: string;
        readonly chart: string;
        readonly storage: string;
    };
};
/** Render the Helm projection returned by Nivo rather than raw Helm output. */
export const HelmStackSnapshot = (props: HelmStackSnapshotProps) => {
    const { runtime, labels }: HelmStackSnapshotProps = props;
    if (runtime === null) {
        return <SurfaceCard label={labels.section}>

        <EmptyNotice message={labels.unavailable}/></SurfaceCard>;
    }
    const storage = runtime.storage.length === 0 ? labels.unavailable : runtime.storage.map(item => `${item.key}: ${item.size ?? "—"} · ${item.policy ?? "—"}`).join(" · ");
    return <SurfaceCard label={labels.section} fact={`${labels.release}: ${runtime.releaseName ?? "—"} · ${labels.chart}: ${runtime.chartName ?? runtime.appKey}@${runtime.chartVersion ?? "—"}`}>


      <DirectionScroll aria-label={labels.section}><HelmComponentStatusTable props={{
            id: runtime.instanceId,
            rows: [...runtime.components.map(component => ({
                    id: component.key,
                    name: component.key,
                    detail: component.image ?? labels.unavailable,
                    kind: component.kind,
                    status: component.status,
                    statusTone: component.status === "ready" || component.status === "available" ? "success" as const : "warning" as const,
                    resources: `${component.readyReplicas ?? "—"}/${component.desiredReplicas ?? "—"} · ${component.restartCount} restarts`
                })), {
                    id: "storage",
                    name: labels.storage,
                    detail: storage,
                    kind: "PVC",
                    status: runtime.storage.every(item => item.status === "bound") ? "bound" : "observed",
                    statusTone: "neutral" as const,
                    resources: `${runtime.storage.length}`
                }]
        }}/></DirectionScroll></SurfaceCard>;
};
