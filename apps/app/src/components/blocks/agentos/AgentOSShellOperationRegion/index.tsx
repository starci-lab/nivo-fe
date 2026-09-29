import { operationValueOf } from "@/modules/agentos/workspace-control-center/shell-display"
import type { AgentOSShellOperationView, AgentOSWorkspaceControlCenterShellLabels } from "@/modules/agentos/workspace-control-center/shell-types"
import { SurfaceCard, Text, TextAction } from "@starci/grammar/common"

/** One returned operation's own result card: exact receiver, its standing and its source time. */
export type AgentOSShellOperationRegionProps = {
    readonly operations: ReadonlyArray<AgentOSShellOperationView>
    readonly labels: AgentOSWorkspaceControlCenterShellLabels
    readonly formatDate: (value: string) => string
    readonly onRecheck?: (installationId: string, intentId: string) => void
    readonly recheckPending?: boolean
}
/**
 * The returned operations' own result region: each receiver receipt is its own card, and a recheck
 * is only ever a fresh read of that same receipt - a confirmed standing offers no further action.
 */
export const AgentOSShellOperationRegion = (props: AgentOSShellOperationRegionProps) => {
    const { operations, labels, formatDate, onRecheck, recheckPending }: AgentOSShellOperationRegionProps = props
    return (
        <>
            {operations.map((operation) => (
                <SurfaceCard
                    key={`receiver:{${operation.installationId},${operation.intentId}}`}
                    label={`${labels.resultSection} · ${operation.receiverName}`}
                    fact={operation.observedAt === null ? undefined : formatDate(operation.observedAt)}
                >
                    <Text size="md">{operationValueOf(operation, labels)}</Text>
                    <Text size="sm" tone="muted">
                        {[operation.installationId, operation.intentId, operation.commandId]
                            .filter((part): part is string => part !== null)
                            .join(" · ")}
                    </Text>
                    {onRecheck === undefined || operation.standing === "confirmed" ? null : (
                        <TextAction
                            onPress={() => onRecheck(operation.installationId, operation.intentId)}
                            isPending={recheckPending === true}
                        >
                            {labels.resultRecheck}
                        </TextAction>
                    )}
                </SurfaceCard>
            ))}
        </>
    )
}
