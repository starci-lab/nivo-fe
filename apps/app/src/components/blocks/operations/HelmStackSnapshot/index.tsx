import { HelmComponentStatusTable, SurfaceCard, defineContractProjection } from "@nivo/ui"
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice"
import type { AgentWorkspaceRuntime } from "@/modules/api/console"

/** Public-safe Helm snapshot and resolved labels consumed by the stack block. */
export type HelmStackSnapshotProps = {
    readonly runtime: AgentWorkspaceRuntime | null
    readonly labels: {
        readonly section: string
        readonly unavailable: string
        readonly release: string
        readonly chart: string
        readonly storage: string
    }
}

/** Render the Helm projection returned by Nivo rather than raw Helm output. */
export const HelmStackSnapshot = ({ runtime, labels }: HelmStackSnapshotProps) => {
    if (runtime === null) {
        return (
            <SurfaceCard
                props={{ label: labels.section }}
                contract="centred-empty-notice"
                render={defineContractProjection("centred-empty-notice", () => <EmptyNotice props={{ message: labels.unavailable }} />)}
            />
        )
    }
    const storage = runtime.storage.length === 0
        ? labels.unavailable
        : runtime.storage.map((item) => `${item.key}: ${item.size ?? "—"} · ${item.policy ?? "—"}`).join(" · ")
    return (
        <SurfaceCard
            props={{ label: labels.section, fact: `${labels.release}: ${runtime.releaseName ?? "—"} · ${labels.chart}: ${runtime.chartName ?? runtime.appKey}@${runtime.chartVersion ?? "—"}` }}
            contract="helm-component-status-table"
            render={defineContractProjection("helm-component-status-table", () => (
                <HelmComponentStatusTable props={{ id: runtime.instanceId, rows: [
                    ...runtime.components.map((component) => ({
                        id: component.key,
                        name: component.key,
                        detail: component.image ?? labels.unavailable,
                        kind: component.kind,
                        status: component.status,
                        statusTone: component.status === "ready" || component.status === "available" ? "success" as const : "warning" as const,
                        resources: `${component.readyReplicas ?? "—"}/${component.desiredReplicas ?? "—"} · ${component.restartCount} restarts`,
                    })),
                    {
                        id: "storage",
                        name: labels.storage,
                        detail: storage,
                        kind: "PVC",
                        status: runtime.storage.every((item) => item.status === "bound") ? "bound" : "observed",
                        statusTone: "neutral" as const,
                        resources: `${runtime.storage.length}`,
                    },
                ] }} />
            ))}
        />
    )
}

/** Source-level tier marker for the pure Helm stack block. */
export const meta = { shape: "block", world: "pure" } as const
