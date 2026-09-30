import { ChoiceTabs } from "@nivo/ui"
import type { Formatter } from "../../../../modules/i18n/formatter"
import { ModuleCockpitRailBlock } from "../ModuleCockpitRailBlock"
import type { DiagnosticsSurfaceProps as DiagnosticsSurfaceDataProps } from "../../../../modules/agentos/module-page/surface-types"
import type { WithModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import { cockpitPane } from "../cockpitPane"
import { cockpitSidecarPane } from "../cockpitSidecarPane"
import { DiagnosticsHealthCard } from "../DiagnosticsHealthCard"
import { DiagnosticsTraceCard } from "../DiagnosticsTraceCard"
import {
    isDiagnosticSignal,
    isDiagnosticsCompactPane,
} from "../../../../modules/agentos/module-page/surface-types.guards"

/** The surface's settled data, plus the locale formatter its connected half resolved. */
export type DiagnosticsSurfaceBaseData = Omit<
    WithModulePageCopy<DiagnosticsSurfaceDataProps>,
    "onSelectSignal" | "onSelectPane"
> & {
    readonly format: Formatter
}

/** The filter and pane commands back into the connected half. */
export type DiagnosticsSurfaceBaseActions = {
    readonly selectSignal: (signal: "all" | "channel" | "ai") => void
    readonly selectPane: (pane: "signals" | "readiness" | "evidence") => void
}

/** Props for {@link DiagnosticsSurfaceBase}: settled data and its commands. */
export type DiagnosticsSurfaceBaseProps = {
    readonly props: DiagnosticsSurfaceBaseData
    readonly on: DiagnosticsSurfaceBaseActions
}

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`; this private alias is the name it accepts while
 * the exported contract stays `<Unit>BaseProps`.
 */
type DiagnosticsSurfaceProps = DiagnosticsSurfaceBaseProps

/** Diagnostic signal filters, runtime health and persisted trace evidence. */
export const DiagnosticsSurfaceBase = (props: DiagnosticsSurfaceProps) => {
    const { copy, installationId, kindKey, workbenchKey, diagnostics, events, selectedSignal, compactPane, format } =
        props.props
    const { selectSignal: onSelectSignal, selectPane: onSelectPane } = props.on
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
                        select: (key) => onSelectPane(isDiagnosticsCompactPane(key) ? key : compactPane),
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
                onSelect: (key: string) => onSelectSignal(isDiagnosticSignal(key) ? key : selectedSignal),
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
                format,
            })}
        </div>
    )
}
