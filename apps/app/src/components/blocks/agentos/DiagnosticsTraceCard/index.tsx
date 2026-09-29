import { SurfaceCard, Text } from "@starci/grammar/common"
import type { DiagnosticsSurfaceProps as DiagnosticsSurfaceDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import type { Formatter } from "../../../../modules/i18n/formatter"

type DiagnosticsTraceCardProps = WithModulePageCopy<
    Pick<DiagnosticsSurfaceDataProps, "installationId" | "kindKey" | "workbenchKey" | "events">
> & { readonly format: Formatter }

type DiagnosticTraceFact = { readonly key: string; readonly label: string; readonly value: string }

const TRACE_DATE_TIME_OPTIONS = { dateStyle: "medium", timeStyle: "short" } as const

const traceFactsFor = (props: DiagnosticsTraceCardProps, format: Formatter): ReadonlyArray<DiagnosticTraceFact> => {
    const { copy, installationId, kindKey, workbenchKey, events } = props
    return [
        { key: "installation", label: copy.diagnostics.installation, value: installationId },
        { key: "kind", label: copy.diagnostics.kind, value: kindKey },
        { key: "workbench", label: copy.diagnostics.workbench, value: workbenchKey },
        ...events
            .slice(-5)
            .reverse()
            .map((event) => ({
                key: `event:${event.id}`,
                label: event.eventType,
                value: `${event.source} · ${format.dateTime(new Date(event.observedAt), TRACE_DATE_TIME_OPTIONS)}`,
            })),
    ]
}

/** Recent persisted events and installation identity for diagnostic evidence. */
export const DiagnosticsTraceCard = (props: DiagnosticsTraceCardProps) => {
    const { copy, events } = props
    const facts = traceFactsFor(props, props.format)
    return (
        <SurfaceCard
            label={copy.diagnostics.trace}
            fact={events.length === 0 ? copy.diagnostics.noEvents : copy.diagnostics.accepted({ count: events.length })}
        >
            <div>
                <div>
                    {facts.map(({ key, label, value }) => (
                        <div key={key}>
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
