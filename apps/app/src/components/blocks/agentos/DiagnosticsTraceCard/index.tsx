import { SurfaceCard, Text } from "@starci/grammar/common"
import type { DiagnosticsSurfaceProps as DiagnosticsSurfaceDataProps } from "@/modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "@/modules/agentos/module-page-copy"

type DiagnosticsTraceCardProps = WithModulePageCopy<
    Pick<DiagnosticsSurfaceDataProps, "installationId" | "kindKey" | "workbenchKey" | "events">
>

/** Recent persisted events and installation identity for diagnostic evidence. */
export const DiagnosticsTraceCard = (props: DiagnosticsTraceCardProps) => {
    const { copy, installationId, kindKey, workbenchKey, events } = props
    const facts: ReadonlyArray<readonly [string, string]> = [
        [copy.diagnostics.installation, installationId],
        [copy.diagnostics.kind, kindKey],
        [copy.diagnostics.workbench, workbenchKey],
        ...events
            .slice(-5)
            .reverse()
            .map(
                (event) =>
                    [event.eventType, `${event.source} · ${new Date(event.observedAt).toLocaleString()}`] as const,
            ),
    ]
    return (
        <SurfaceCard
            label={copy.diagnostics.trace}
            fact={events.length === 0 ? copy.diagnostics.noEvents : copy.diagnostics.accepted({ count: events.length })}
        >
            <div>
                <div>
                    {facts.map(([label, value], index) => (
                        <div key={index}>
                            <Text size="sm">{label}</Text>
                            <Text size="sm" weight="semibold">
                                {value}
                            </Text>
                        </div>
                    ))}
                </div>
            </div>
        </SurfaceCard>
    )
}
