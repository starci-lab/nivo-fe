import { ChoiceTabs } from "@nivo/ui"
import { ModuleCockpitRailBlock } from "@/components/blocks/agentos/ModuleCockpitRailBlock"
import type { DiagnosticsSurfaceProps as DiagnosticsSurfaceDataProps } from "@/modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "@/modules/agentos/module-page-copy"
import { cockpitPane } from "@/components/blocks/agentos/cockpitPane"
import { cockpitSidecarPane } from "@/components/blocks/agentos/cockpitSidecarPane"
import { DiagnosticsHealthCard } from "@/components/blocks/agentos/DiagnosticsHealthCard"
import { DiagnosticsTraceCard } from "@/components/blocks/agentos/DiagnosticsTraceCard"

type DiagnosticsSurfaceProps = WithModulePageCopy<DiagnosticsSurfaceDataProps>

/** Diagnostic signal filters, runtime health and persisted trace evidence. */
export const DiagnosticsSurface = (props: DiagnosticsSurfaceProps) => {
    const {
        copy,
        installationId,
        kindKey,
        workbenchKey,
        diagnostics,
        events,
        selectedSignal,
        compactPane,
        onSelectSignal,
        onSelectPane,
    } = props
    return (
        <div>
            <div>
                <ChoiceTabs
                    props={{
                        label: copy.diagnostics.compact,
                        selectedKey: compactPane,
                        tabs: [
                            {
                                id: "readiness",
                                label: copy.diagnostics.healthTab,
                            },
                            {
                                id: "signals",
                                label: copy.diagnostics.signals,
                            },
                            {
                                id: "evidence",
                                label: copy.diagnostics.traceTab,
                            },
                        ],
                    }}
                    on={{
                        select: (key) => onSelectPane(key as DiagnosticsSurfaceDataProps["compactPane"]),
                    }}
                />
            </div>
            {cockpitPane(compactPane !== "signals", ModuleCockpitRailBlock, {
                label: copy.diagnostics.signals,
                fact: copy.diagnostics.events({ count: events.length }),
                summary: copy.diagnostics.filterNotice,
                items: [
                    {
                        id: "all",
                        label: copy.diagnostics.all,
                        status: copy.diagnostics.checks({ count: Object.keys(diagnostics).length }),
                    },
                    {
                        id: "channel",
                        label: copy.diagnostics.channel,
                        status: copy.diagnostics.telegramEvents({
                            count: events.filter((event) => event.source.toLowerCase().includes("telegram")).length,
                        }),
                    },
                    {
                        id: "ai",
                        label: copy.diagnostics.ai,
                        status: copy.diagnostics.boundReplies({
                            count: events.filter((event) => event.replyContractKey.length > 0).length,
                        }),
                    },
                ],
                selectedId: selectedSignal,
                onSelect: (key: string) => onSelectSignal(key as DiagnosticsSurfaceDataProps["selectedSignal"]),
            })}
            {cockpitPane(compactPane !== "readiness", DiagnosticsHealthCard, {
                copy,
                diagnostics,
                selectedSignal,
            })}
            {cockpitSidecarPane(compactPane !== "evidence", DiagnosticsTraceCard, {
                copy,
                installationId,
                kindKey,
                workbenchKey,
                events,
            })}
        </div>
    )
}
