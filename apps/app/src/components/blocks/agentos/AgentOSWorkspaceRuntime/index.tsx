import {
    LabelledProgressRow,
    SurfaceCard,
    Text,
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@nivo/ui"
import type { AgentWorkspaceControlCenter } from "@/modules/api/console"

/** Runtime snapshot and resolved copy consumed by the metrics block. */
export type AgentOSWorkspaceRuntimeProps = {
    readonly data: AgentWorkspaceControlCenter
    readonly labels: {
        readonly section: string
        readonly cpu: string
        readonly memory: string
        readonly requests: string
        readonly limits: string
        readonly restarts: string
        readonly health: string
        readonly fresh: string
        readonly stale: string
        readonly unavailable: string
    }
    readonly formatDate: (value: string) => string
}

const percentage = (usage: number | null, limit: number): number => usage === null || limit <= 0
    ? 0
    : Math.min(100, Math.round((usage / limit) * 100))

const mib = (bytes: number): string => `${Math.round(bytes / 1024 / 1024)} MiB`

const fact = (label: string, value: string) => defineContractComponent("label-value-row", {
    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: label, size: "sm" }} />),
    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: value, size: "sm" }} />),
})

/** Draw measured usage without presenting allocation or a missing metric as current usage. */
export const AgentOSWorkspaceRuntime = ({ data, labels, formatDate }: AgentOSWorkspaceRuntimeProps) => {
    const runtime = data.runtime
    const totals = runtime?.totals
    const cpuText = totals?.cpuUsageMillicores === null || totals === undefined
        ? labels.unavailable
        : `${Math.round(totals.cpuUsageMillicores)}m / ${Math.round(totals.cpuLimitMillicores)}m`
    const memoryText = totals?.memoryUsageBytes === null || totals === undefined
        ? labels.unavailable
        : `${mib(totals.memoryUsageBytes)} / ${mib(totals.memoryLimitBytes)}`
    const note = runtime === null
        ? labels.unavailable
        : `${runtime.stale ? labels.stale : labels.fresh} · ${formatDate(runtime.observedAt)}`
    return (
        <SurfaceCard
            props={{ label: labels.section }}
            contract="workspace-runtime-stack"
            render={defineContractComponent("workspace-runtime-stack", {
                metric: [
                    defineCompositeComponent("labelled-progress-row", {}, () => (
                        <LabelledProgressRow props={{ id: "cpu", title: labels.cpu, percent: percentage(totals?.cpuUsageMillicores ?? null, totals?.cpuLimitMillicores ?? 0), percentText: cpuText }} />
                    )),
                    defineCompositeComponent("labelled-progress-row", {}, () => (
                        <LabelledProgressRow props={{ id: "memory", title: labels.memory, percent: percentage(totals?.memoryUsageBytes ?? null, totals?.memoryLimitBytes ?? 0), percentText: memoryText }} />
                    )),
                ],
                facts: defineContractComponent("labelled-fact-stack", {
                    fact: [
                        fact(labels.requests, totals === undefined ? "—" : `${Math.round(totals.cpuRequestMillicores)}m · ${mib(totals.memoryRequestBytes)}`),
                        fact(labels.limits, totals === undefined ? "—" : `${Math.round(totals.cpuLimitMillicores)}m · ${mib(totals.memoryLimitBytes)}`),
                        fact(labels.restarts, String(totals?.restartCount ?? 0)),
                        fact(labels.health, runtime?.probeStatus ?? "unavailable"),
                    ],
                }),
                note: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: note, size: "sm", tone: "muted" }} />),
            })}
        />
    )
}

/** Source-level tier marker for the pure runtime block. */
export const meta = { shape: "block", world: "pure" } as const
