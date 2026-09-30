import {
    Button,
    EmptyNotice,
    StaticStateRow,
    SurfaceCard,
    SurfaceListCard,
    Text,
    TextAction,
    type StaticStateRowData,
} from "@starci/grammar/common"
import {
    AGENT_OS_SIGN_IN_HREF,
    AgentOSShellOperationRegion,
    type AgentOSShellConfigurationDigests,
    type AgentOSShellView,
    type AgentOSWorkspaceControlCenterShellLabels,
} from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter"
import {
    MODULE_COLLECTION_SOURCE_TIME_CLASS_NAME,
    MODULE_LEDGER_ACTION_BAND_CLASS_NAME,
    MODULE_LEDGER_ACTION_FILL_CLASS_NAME,
    MODULE_LEDGER_BAND_CLASS_NAME,
    MODULE_LEDGER_FACETS_CLASS_NAME,
    MODULE_LEDGER_NOTICE_CLASS_NAME,
} from "./classNames"
import type { AgentOSModuleCollectionPageLabels } from "./component"

/** The one sentence a limited facet owes its reader, chosen by that source's own standing. */
const ledgerLimitOf = (
    standing: AgentOSShellView["inventoryStanding"],
    labels: AgentOSWorkspaceControlCenterShellLabels,
): string => {
    if (standing === "stale") return labels.inventoryLimitStale
    if (standing === "unavailable") return labels.inventoryLimitUnavailable
    if (standing === "unsupported") return labels.inventoryLimitUnsupported
    if (standing === "refused") return labels.inventoryLimitRefused
    if (standing === "loading" || standing === "unresolved") return labels.inventoryLimitLoading
    return labels.inventoryLimitPartial
}

/** The runtime facet's own value: what the runtime source said, never what a neighbour implied. */
const ledgerRuntimeValueOf = (shell: AgentOSShellView, labels: AgentOSWorkspaceControlCenterShellLabels): string => {
    if (shell.runtimeStanding === "unsupported" || shell.runtimeStanding === "refused")
        return ledgerLimitOf(shell.runtimeStanding, labels)
    if (shell.runtimeAvailability === "provisioned") return labels.runtimeProvisioned
    if (shell.runtimeAvailability === "not_provisioned") return labels.runtimeNotProvisioned
    if (shell.runtimeAvailability === "unavailable") return labels.runtimeUnavailable
    return labels.runtimeUnknown
}

/** The plain runtime line of the ledger heading: the runtime source's own word, compactly. */
const ledgerRuntimeLineOf = (
    shell: AgentOSShellView,
    labels: AgentOSModuleCollectionPageLabels,
    runtimeLine: (value: string) => string,
): string => {
    const value =
        shell.runtimeStanding === "current" || shell.runtimeStanding === "partial" || shell.runtimeStanding === "stale"
            ? shell.runtimeAvailability === "provisioned"
                ? labels.runtimeProvisioned
                : shell.runtimeAvailability === "not_provisioned"
                  ? labels.runtimeNotProvisioned
                  : shell.runtimeAvailability === "unavailable"
                    ? labels.runtimeUnavailable
                    : labels.runtimeUnknown
            : labels.runtimeUnknown
    return runtimeLine(value)
}

/** One source-qualified fact of the ledger: the label names its source, the value is its answer. */
type ModuleLedgerFacetProps = {
    readonly label: string
    readonly value: string
    readonly fact?: string
}
const ModuleLedgerFacet = (props: ModuleLedgerFacetProps) => (
    <SurfaceCard label={props.label} {...(props.fact === undefined ? {} : { fact: props.fact })}>
        <Text size="md">{props.value}</Text>
    </SurfaceCard>
)

type ModuleLedgerEmptyProps = {
    readonly shell: AgentOSShellView
    readonly shellLabels: AgentOSWorkspaceControlCenterShellLabels
    readonly labels: AgentOSModuleCollectionPageLabels
    readonly createHref: string
    readonly formatDate: (value: string) => string
    readonly installedIn: (name: string) => string
    readonly runtimeLine: (value: string) => string
    readonly onRetryOperation?: (installationId: string, intentId: string) => void
    readonly isRetrying?: boolean
}
/**
 * The accepted none-installed answer: one dominant joined surface carrying the empty notice and its
 * install entry in the same card, under the external inventory label. Nothing else may borrow this
 * composition - it belongs to a current, complete, authorized zero, never to a limited one.
 */
export const ModuleLedgerEmpty = (props: ModuleLedgerEmptyProps) => {
    const {
        shell,
        shellLabels,
        labels,
        createHref,
        formatDate,
        installedIn,
        runtimeLine,
        onRetryOperation,
        isRetrying,
    }: ModuleLedgerEmptyProps = props
    return (
        <>
            <div className={MODULE_COLLECTION_SOURCE_TIME_CLASS_NAME} data-region="runtime">
                <Text size="sm" tone="muted">
                    {ledgerRuntimeLineOf(shell, labels, runtimeLine)}
                </Text>
            </div>
            <div data-region="module-inventory">
                <SurfaceCard label={installedIn(shell.name ?? shell.workspaceId ?? "")} composition="joined">
                    <div className={MODULE_LEDGER_BAND_CLASS_NAME}>
                        <EmptyNotice
                            message={shellLabels.inventoryEmpty}
                            description={shellLabels.inventoryEmptyDescription}
                        />
                    </div>
                    <div className={MODULE_LEDGER_ACTION_BAND_CLASS_NAME} data-region="install-entry">
                        <div className={MODULE_LEDGER_ACTION_FILL_CLASS_NAME}>
                            <Button variant="primary" width="fill" href={createHref}>
                                {labels.browseCatalog}
                            </Button>
                        </div>
                        <TextAction href={createHref}>{labels.installFlow}</TextAction>
                    </div>
                </SurfaceCard>
            </div>
            {shell.operations.length === 0 ? null : (
                <div data-region="result">
                    <AgentOSShellOperationRegion
                        operations={shell.operations}
                        labels={shellLabels}
                        formatDate={formatDate}
                        onRecheck={onRetryOperation}
                        recheckPending={isRetrying}
                    />
                </div>
            )}
        </>
    )
}

type ModuleLedgerRegionsProps = {
    readonly shell: AgentOSShellView
    readonly labels: AgentOSWorkspaceControlCenterShellLabels
    readonly formatDate: (value: string) => string
    readonly formatConfiguration: (digests: AgentOSShellConfigurationDigests) => string
    readonly onRetry?: () => void
    readonly onRetryOperation?: (installationId: string, intentId: string) => void
    readonly isRetrying?: boolean
}
/**
 * The ledger's own regions: the actual installation peer list, the returned operations' receipts and
 * the separate source-qualified facets. It draws only what the projection settled.
 */
export const ModuleLedgerRegions = (props: ModuleLedgerRegionsProps) => {
    const {
        shell,
        labels,
        formatDate,
        formatConfiguration,
        onRetry,
        onRetryOperation,
        isRetrying,
    }: ModuleLedgerRegionsProps = props
    const inventoryFact =
        shell.inventoryStanding === "current" && shell.inventoryObservedAt !== null
            ? formatDate(shell.inventoryObservedAt)
            : undefined
    const inventoryRows: ReadonlyArray<{ id: string; item: StaticStateRowData }> = shell.installations.map(
        (installation) => ({
            id: installation.installationId,
            item: {
                id: installation.installationId,
                label: installation.displayName,
                description: [installation.moduleKey, installation.status, installation.installationId]
                    .filter((part): part is string => part !== null)
                    .join(" · "),
            },
        }),
    )
    return (
        <>
            <div data-region="module-inventory">
                <SurfaceListCard
                    label={labels.inventorySection}
                    {...(inventoryFact === undefined ? {} : { fact: inventoryFact })}
                >
                    {inventoryRows.map((row) => (
                        <StaticStateRow key={row.id} item={row.item} />
                    ))}
                </SurfaceListCard>
            </div>
            {shell.inventoryStanding !== "current" ? (
                <SurfaceCard label={labels.inventorySection}>
                    <Text size="md" tone="muted">
                        {ledgerLimitOf(shell.inventoryStanding, labels)}
                    </Text>
                    {onRetry === undefined ? null : (
                        <TextAction onPress={onRetry} isPending={isRetrying === true}>
                            {labels.retry}
                        </TextAction>
                    )}
                </SurfaceCard>
            ) : null}
            <div data-region="result">
                <AgentOSShellOperationRegion
                    operations={shell.operations}
                    labels={labels}
                    formatDate={formatDate}
                    onRecheck={onRetryOperation}
                    recheckPending={isRetrying}
                />
            </div>
            <div className={MODULE_LEDGER_FACETS_CLASS_NAME}>
                <ModuleLedgerFacet
                    label={labels.runtimeSection}
                    fact={shell.runtimeObservedAt === null ? undefined : formatDate(shell.runtimeObservedAt)}
                    value={ledgerRuntimeValueOf(shell, labels)}
                />
                {shell.installations.map((installation) => (
                    <ModuleLedgerFacet
                        key={"configuration-" + installation.installationId}
                        label={labels.configurationSection + " · " + installation.displayName}
                        fact={
                            installation.configuration === null || installation.configuration.observedAt === null
                                ? undefined
                                : formatDate(installation.configuration.observedAt)
                        }
                        value={
                            installation.configuration === null
                                ? labels.configurationUnsupported
                                : installation.configuration.standing === "current"
                                  ? formatConfiguration({
                                        desired: installation.configuration.desiredDigest ?? "-",
                                        tested: installation.configuration.testedDigest ?? "-",
                                        applied: installation.configuration.appliedDigest ?? "-",
                                    })
                                  : installation.configuration.standing === "unsupported"
                                    ? labels.configurationUnsupported
                                    : labels.configurationAbsent
                        }
                    />
                ))}
                <ModuleLedgerFacet
                    label={labels.attentionSection}
                    fact={shell.attentionObservedAt === null ? undefined : formatDate(shell.attentionObservedAt)}
                    value={
                        shell.attentionStanding === "unsupported" || shell.attentionStanding === "unresolved"
                            ? labels.attentionUnsupported
                            : ledgerLimitOf(shell.attentionStanding, labels)
                    }
                />
                {shell.operations.length === 0 ? (
                    <div data-region="result">
                        <ModuleLedgerFacet label={labels.resultSection} value={labels.resultUnavailable} />
                    </div>
                ) : null}
            </div>
        </>
    )
}

type ModuleLedgerAccessNoticeProps = {
    readonly state: AgentOSShellView["state"]
    readonly labels: AgentOSWorkspaceControlCenterShellLabels
    readonly onRetry?: () => void
    readonly isRetrying?: boolean
}
/** One settled access state: a retryable verification failure, a refusal, or a sign-in affordance that discloses no scope. */
export const ModuleLedgerAccessNotice = (props: ModuleLedgerAccessNoticeProps) => {
    const { state, labels, onRetry, isRetrying }: ModuleLedgerAccessNoticeProps = props
    if (state === "sign-in-required")
        return (
            <div className={MODULE_LEDGER_NOTICE_CLASS_NAME}>
                <Text size="md" tone="muted">
                    {labels.signInRequired}
                </Text>
                <TextAction href={AGENT_OS_SIGN_IN_HREF}>{labels.signInAction}</TextAction>
            </div>
        )
    return (
        <EmptyNotice
            message={state === "access-denied" ? labels.accessDenied : labels.accessUnverified}
            actionLabel={onRetry === undefined ? undefined : labels.retry}
            isActionPending={isRetrying === true}
            onAction={onRetry}
        />
    )
}
