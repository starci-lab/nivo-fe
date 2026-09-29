"use client"

import { useAgentOSSolutionModuleCenter } from "@/hooks/agentos/useAgentOSSolutionModuleCenter"
import type { AgentOSSolutionModuleCenterRouteProps } from "@/modules/agentos/solution-module-center"
import { QueryNotice } from "@/components/blocks/query/QueryNotice"
import { AgentOSSolutionModuleCenterBase } from "./component"

/** Exact workspace and layout scope for the connected module center. */
export type AgentOSSolutionModuleCenterProps = AgentOSSolutionModuleCenterRouteProps

/** Connect catalog, installation and Saga state to the pure solution module center. */
export const AgentOSSolutionModuleCenter = (props: AgentOSSolutionModuleCenterProps) => {
    const view = useAgentOSSolutionModuleCenter(props)
    const { catalogReading, installationsReading, copy } = view
    const failedReading =
        catalogReading.status === "failed"
            ? catalogReading
            : installationsReading.status === "failed"
              ? installationsReading
              : null
    return (
        <AgentOSSolutionModuleCenterBase
            state={view.isResting ? "resting" : failedReading === null ? "answered" : "failed"}
            props={{
                layout: view.layout,
                mode: view.mode,
                sectionLabel: view.mode === "catalog" ? copy.catalogSection : copy.installedSection,
                modesLabel: copy.modesLabel,
                modes: [
                    { id: "catalog", label: copy.catalogMode },
                    { id: "installed", label: copy.installedMode },
                ],
                notice:
                    failedReading === null ? undefined : (
                        <QueryNotice props={{ failure: failedReading }} on={{ retry: () => void view.refresh() }} />
                    ),
                emptyLabel: copy.empty,
                emptyActionLabel: copy.browse,
                cards: view.layout === "ledger" || view.mode === "catalog" ? view.catalogCards : view.installedCards,
                pendingId: view.pendingKey,
                outcome: view.outcome,
                ledger: {
                    installedLabel: copy.installedSection,
                    catalogLabel: copy.catalogSection,
                    installedState: view.installationsState,
                    catalogueState: view.catalogState,
                    installedNotice:
                        installationsReading.status === "failed" ? (
                            <QueryNotice
                                props={{ failure: installationsReading, retryPending: view.isInstallationsValidating }}
                                on={{ retry: () => void view.refreshInstallations() }}
                            />
                        ) : undefined,
                    catalogueNotice:
                        catalogReading.status === "failed" ? (
                            <QueryNotice
                                props={{ failure: catalogReading, retryPending: view.isCatalogValidating }}
                                on={{ retry: () => void view.refreshCatalog() }}
                            />
                        ) : undefined,
                    installedRows: view.installedRows,
                    installedEmptyTitle: copy.emptyTitle,
                    installedEmpty: copy.emptyHint,
                    catalogueEmptyTitle: copy.catalogueEmptyTitle,
                    catalogueEmpty: copy.catalogueEmptyHint,
                    installedEmptyAction: copy.installedEmptyAction,
                },
            }}
            on={{ onSelectMode: view.setMode, onPressCard: view.onPressCard }}
        />
    )
}
