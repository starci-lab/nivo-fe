import { useMemo } from "react"
import { facetLimitOf, runtimeValueOf } from "@/modules/agentos/workspace-control-center/shell-display"
import type {
    AgentOSShellConfigurationDigests,
    AgentOSShellView,
    AgentOSWorkspaceControlCenterShellLabels,
} from "@/modules/agentos/workspace-control-center/shell-types"
import { AgentOSShellOperationRegion } from "@/components/blocks/agentos/AgentOSShellOperationRegion"
import { SHELL_FACETS_CLASS_NAME } from "./classNames"
import { EmptyNotice, StaticStateRow, SurfaceCard, SurfaceListCard, Text, TextAction } from "@starci/grammar/common"

type ShellFacetProps = {
    readonly label: string
    readonly value: string
    readonly fact?: string
}
const ShellFacet = (props: ShellFacetProps) => (
    <SurfaceCard label={props.label} {...(props.fact === undefined ? {} : { fact: props.fact })}>
        <Text size="md">{props.value}</Text>
    </SurfaceCard>
)

type AgentOSWorkspaceShellProps = {
    readonly view: AgentOSShellView
    readonly labels: AgentOSWorkspaceControlCenterShellLabels
    readonly formatDate: (value: string) => string
    readonly formatConfiguration: (digests: AgentOSShellConfigurationDigests) => string
    readonly onRetry?: () => void
    readonly retrying?: boolean
    readonly onRecheckOperation?: (installationId: string, intentId: string) => void
}

/** Draw source-qualified installation, runtime, configuration, attention and operation evidence. */
export const AgentOSWorkspaceShell = (props: AgentOSWorkspaceShellProps) => {
    const { view, labels, formatDate, formatConfiguration, onRetry, retrying, onRecheckOperation } = props
    const inventoryFact =
        view.inventoryStanding === "current" && view.inventoryObservedAt !== null
            ? formatDate(view.inventoryObservedAt)
            : undefined
    const inventoryItems = useMemo(
        () =>
            view.installations.map((installation) => ({
                id: installation.installationId,
                label: installation.displayName,
                description: [installation.moduleKey, installation.status, installation.installationId]
                    .filter((part): part is string => part !== null)
                    .join(" · "),
            })),
        [view.installations],
    )
    return (
        <>
            <SurfaceListCard
                label={labels.inventorySection}
                {...(inventoryFact === undefined ? {} : { fact: inventoryFact })}
            >
                {inventoryItems.map((item) => (
                    <StaticStateRow key={item.id} item={item} />
                ))}
            </SurfaceListCard>
            {view.state === "installed-empty" ? (
                <EmptyNotice message={labels.inventoryEmpty} description={labels.inventoryEmptyDescription} />
            ) : null}
            {view.inventoryStanding !== "current" ? (
                <SurfaceCard label={labels.inventorySection}>
                    <Text size="md" tone="muted">
                        {facetLimitOf(view.inventoryStanding, labels)}
                    </Text>
                    {onRetry === undefined ? null : (
                        <TextAction onPress={onRetry} isPending={retrying === true}>
                            {labels.retry}
                        </TextAction>
                    )}
                </SurfaceCard>
            ) : null}
            <AgentOSShellOperationRegion
                operations={view.operations}
                labels={labels}
                formatDate={formatDate}
                onRecheck={onRecheckOperation}
                recheckPending={retrying}
            />
            <div className={SHELL_FACETS_CLASS_NAME}>
                <ShellFacet
                    label={labels.runtimeSection}
                    fact={view.runtimeObservedAt === null ? undefined : formatDate(view.runtimeObservedAt)}
                    value={runtimeValueOf(view, labels)}
                />
                {view.installations.map((installation) => (
                    <ShellFacet
                        key={"configuration-" + installation.installationId}
                        label={labels.configurationSection + " · " + installation.displayName}
                        fact={
                            installation.configuration?.observedAt === null || installation.configuration === null
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
                <ShellFacet
                    label={labels.attentionSection}
                    fact={view.attentionObservedAt === null ? undefined : formatDate(view.attentionObservedAt)}
                    value={
                        view.attentionStanding === "unsupported" || view.attentionStanding === "unresolved"
                            ? labels.attentionUnsupported
                            : facetLimitOf(view.attentionStanding, labels)
                    }
                />
                {view.operations.length === 0 ? (
                    <ShellFacet label={labels.resultSection} value={labels.resultUnavailable} />
                ) : null}
            </div>
        </>
    )
}
