import { Breadcrumbs } from "@nivo/ui"
import { PageContainer, SectionHeader, SurfaceCard, Text } from "@starci/grammar/common"
import type {
    AgentOSShellConfigurationDigests,
    AgentOSShellView,
    AgentOSWorkspaceControlCenterShellLabels,
} from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter"
import { MODULE_COLLECTION_GRID_CLASS_NAME, MODULE_COLLECTION_PAGE_CLASS_NAME } from "./classNames"
import { ModuleLedgerAccessNotice, ModuleLedgerEmpty, ModuleLedgerRegions } from "./ModuleLedger"

/** Public API role for AgentOSModuleCollectionPageProps. */
export type AgentOSModuleCollectionPageProps = {
    readonly props: AgentOSModuleCollectionPageViewProps
    readonly on: AgentOSModuleCollectionPageViewActions
}
type AgentOSModuleCollectionPageViewProps = {
    readonly workspaceId: string
    readonly shell: AgentOSShellView
    readonly shellLabels: AgentOSWorkspaceControlCenterShellLabels
    readonly labels: AgentOSModuleCollectionPageLabels
    readonly createHref: string
    readonly isShellRetrying?: boolean
}

/** Resolved labels used by the module collection page and its ledger regions. */
export type AgentOSModuleCollectionPageLabels = {
    readonly path: string
    readonly workspace: string
    readonly title: string
    readonly browseCatalog: string
    readonly installFlow: string
    readonly runtimeProvisioned: string
    readonly runtimeNotProvisioned: string
    readonly runtimeUnavailable: string
    readonly runtimeUnknown: string
}
type AgentOSModuleCollectionPageViewActions = {
    readonly onBack: () => void
    readonly onRetryShell?: () => void
    readonly onRetryOperation?: (installationId: string, intentId: string) => void
    readonly formatDate: (value: string) => string
    /** The sentence naming when the inventory read was checked. */
    readonly checkedAt: (time: string) => string
    /** The heading naming the workspace the installations live in. */
    readonly installedIn: (name: string) => string
    /** The compact runtime line of the ledger heading. */
    readonly runtimeLine: (value: string) => string
    /** The sentence phrasing a current configuration observation's three digests. */
    readonly formatConfiguration: (digests: AgentOSShellConfigurationDigests) => string
}

/**
 * Compose the module ledger under one route identity: a compact heading, the source statement of the
 * inventory read, then the connected shell's own regions as one column. The permitted empty answer is
 * one dominant card with its next step attached inside it. A sign-in-required or refused access state
 * replaces the ledger instead of qualifying it, so no installation is ever hinted at without access.
 */
export const AgentOSModuleCollectionPageBase = (props: AgentOSModuleCollectionPageProps) => {
    const { shell, shellLabels, labels, createHref, isShellRetrying }: AgentOSModuleCollectionPageViewProps =
        props.props
    const {
        onBack,
        onRetryShell,
        onRetryOperation,
        formatDate,
        checkedAt,
        installedIn,
        runtimeLine,
        formatConfiguration,
    }: AgentOSModuleCollectionPageViewActions = props.on
    const accessState =
        shell.state === "sign-in-required" || shell.state === "access-unverified" || shell.state === "access-denied"
    const sourceStatement =
        accessState || shell.inventoryObservedAt === null ? null : checkedAt(formatDate(shell.inventoryObservedAt))
    return (
        <PageContainer measure="product">
            <div className={MODULE_COLLECTION_PAGE_CLASS_NAME} data-region="page" data-contract="GAP-5">
                <Breadcrumbs
                    props={{
                        mode: "trail",
                        label: labels.path,
                        steps: [
                            {
                                id: "workspace",
                                label: labels.workspace,
                            },
                            {
                                id: "modules",
                                label: labels.title,
                                isCurrent: true,
                            },
                        ],
                    }}
                    on={{
                        activate: onBack,
                    }}
                />
                <SectionHeader
                    level={1}
                    title={labels.title}
                    {...(sourceStatement === null
                        ? {}
                        : {
                              description: (
                                  <Text size="sm" tone="muted">
                                      {sourceStatement}
                                  </Text>
                              ),
                          })}
                />
                <SurfaceCard label={labels.title} data-region="module-collection" data-contract="GAP-4">
                    {accessState ? (
                        <ModuleLedgerAccessNotice
                            state={shell.state}
                            labels={shellLabels}
                            onRetry={onRetryShell}
                            isRetrying={isShellRetrying}
                        />
                    ) : shell.inventoryEmpty ? (
                        <ModuleLedgerEmpty
                            shell={shell}
                            shellLabels={shellLabels}
                            labels={labels}
                            createHref={createHref}
                            formatDate={formatDate}
                            installedIn={installedIn}
                            runtimeLine={runtimeLine}
                            onRetryOperation={onRetryOperation}
                            isRetrying={isShellRetrying}
                        />
                    ) : (
                        <ModuleLedgerRegions
                            shell={shell}
                            labels={shellLabels}
                            formatDate={formatDate}
                            formatConfiguration={formatConfiguration}
                            onRetry={onRetryShell}
                            onRetryOperation={onRetryOperation}
                            isRetrying={isShellRetrying}
                        />
                    )}
                </SurfaceCard>
            </div>
        </PageContainer>
    )
}
