import { SurfaceCard, Text } from "@starci/grammar/common"
import type { AgentosRuntimeValue } from "@/modules/api/agentos-runtime-tree"
import type { DiagnosticsSurfaceProps as DiagnosticsSurfaceDataProps } from "@/modules/agentos/module-page/surface-types"
import type { WithModulePageCopy, ModulePageCopy } from "@/modules/agentos/module-page-copy"

type DiagnosticsHealthCardProps = WithModulePageCopy<
    Pick<DiagnosticsSurfaceDataProps, "diagnostics" | "selectedSignal">
>

const safeValue = (value: AgentosRuntimeValue): string => {
    if (value === null) return "—"
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value)
    return JSON.stringify(value)
}

const diagnosticEntries = (
    diagnostics: Readonly<Record<string, AgentosRuntimeValue>>,
    selectedSignal: DiagnosticsSurfaceDataProps["selectedSignal"],
) => {
    const entries = Object.entries(diagnostics)
    if (selectedSignal === "all") return entries
    const filtered = entries.filter(([key]) => {
        const normalized = key.toLowerCase()
        return selectedSignal === "channel"
            ? ["telegram", "channel", "webhook"].some((token) => normalized.includes(token))
            : ["ai", "cache", "prompt", "controller", "model"].some((token) => normalized.includes(token))
    })
    return filtered.length > 0 ? filtered : entries
}

const diagnosticFacts = (entries: ReadonlyArray<readonly [string, AgentosRuntimeValue]>, copy: ModulePageCopy) =>
    entries.map(([key, value], index) => (
        <div key={index}>
            <Text size="sm">{copy.labels.field({ key })}</Text>
            <Text size="sm" weight="semibold">
                {safeValue(value)}
            </Text>
        </div>
    ))

const diagnosticHealthFact = (
    selectedSignal: DiagnosticsSurfaceDataProps["selectedSignal"],
    copy: ModulePageCopy,
): string => {
    if (selectedSignal === "all") return copy.diagnostics.all
    return selectedSignal === "channel" ? copy.diagnostics.channel : copy.diagnostics.ai
}

/** Filtered runtime health fields and their safety notice. */
export const DiagnosticsHealthCard = (props: DiagnosticsHealthCardProps) => {
    const { copy, diagnostics, selectedSignal } = props
    return (
        <SurfaceCard label={copy.diagnostics.health} fact={diagnosticHealthFact(selectedSignal, copy)}>
            <div>
                <div>{diagnosticFacts(diagnosticEntries(diagnostics, selectedSignal), copy)}</div>

                <Text size="sm" tone="muted">
                    {copy.diagnostics.safeNotice}
                </Text>
            </div>
        </SurfaceCard>
    )
}
