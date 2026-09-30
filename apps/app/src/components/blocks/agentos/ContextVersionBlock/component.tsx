import { Badge, Button, Heading, SurfaceCard, Text } from "@starci/grammar/common"
import { CONTEXT_BAND_CLASS_NAME, CONTEXT_GATE_ROW_CLASS_NAME, CONTEXT_RAISED_BAND_CLASS_NAME } from "./classNames"
import type { ContextDraft } from "./index"

/** Resolved sentences and evidence drawn for one context revision. */
type ContextVersionBlockBaseData = {
    readonly labels: {
        readonly gatesReview: string
        readonly reviewContext: string
        readonly setupGates: string
        readonly noGates: string
        readonly confirmed: string
        readonly complete: string
        readonly needsFollowUp: string
        readonly confirmRequirement: string
        readonly evidenceRequired: string
        readonly exactTest: string
    }
    readonly reviewSummary: string
    readonly summary: string
    readonly factRows: ReadonlyArray<{ readonly fact: string; readonly key: string }>
    readonly gates: ContextDraft["gates"]
    readonly completeCount: string
    readonly testStatus: string
    readonly applyHint: string
    readonly applyLabel: string
    readonly pending: boolean
    readonly ownPending: boolean
    readonly peerDisabled: boolean
    readonly refused: boolean
    readonly actionDisabled: boolean
}

/** Bound commands for the currently selected context revision. */
type ContextVersionBlockBaseActions = {
    readonly apply: () => void
    readonly confirmRequirement: (gate: ContextDraft["gates"][number]) => void
}

/** Pure review drawing receives resolved data and commands. */
type ContextVersionBlockBaseProps = {
    readonly props: ContextVersionBlockBaseData
    readonly on: ContextVersionBlockBaseActions
}

/** Draw context evidence, owner confirmations and exact version activation readiness. */
export const ContextVersionBlockBase = (props: ContextVersionBlockBaseProps) => {
    const { labels, gates } = props.props
    const data = props.props
    return (
        <SurfaceCard ariaLabel={labels.gatesReview} composition="joined">
            <div className={CONTEXT_RAISED_BAND_CLASS_NAME} data-contract="SURFACE-3 GAP-3 PADDING-4">
                <Heading level={3}>{labels.reviewContext}</Heading>
                <Text size="sm" tone="muted">
                    {data.reviewSummary}
                </Text>
            </div>
            <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
                <Text size="sm" weight="semibold">
                    {data.summary}
                </Text>
                {data.factRows.map(({ fact, key }) => (
                    <Text size="sm" key={key}>
                        {fact}
                    </Text>
                ))}
            </div>
            <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
                <Heading level={4}>{labels.setupGates}</Heading>
                {gates.length > 0 ? (
                    <Text size="sm" weight="semibold">
                        {data.completeCount}
                    </Text>
                ) : (
                    <Text size="sm" tone="muted">
                        {labels.noGates}
                    </Text>
                )}
                {gates.map((gate) => (
                    <div
                        className={CONTEXT_GATE_ROW_CLASS_NAME}
                        data-contract="BOUNDARY-1 GAP-2 PADDING-3"
                        key={gate.key}
                    >
                        <Text size="sm">{gate.label}</Text>
                        <Badge
                            tone={gate.passed && (!gate.ownerConfirmation || gate.confirmed) ? "success" : "neutral"}
                        >
                            {gate.confirmed ? labels.confirmed : gate.passed ? labels.complete : labels.needsFollowUp}
                        </Badge>
                        {gate.passed && gate.ownerConfirmation && !gate.confirmed ? (
                            gate.citationPolicy === "none" ? (
                                <Button
                                    variant="secondary"
                                    isDisabled={data.peerDisabled || data.pending}
                                    onPress={() => props.on.confirmRequirement(gate)}
                                >
                                    {labels.confirmRequirement}
                                </Button>
                            ) : (
                                <Text size="xs" tone="muted">
                                    {labels.evidenceRequired}
                                </Text>
                            )
                        ) : null}
                    </div>
                ))}
            </div>
            <div className={CONTEXT_BAND_CLASS_NAME} data-contract="BOUNDARY-1 GAP-3 PADDING-4">
                <Heading level={4}>{labels.exactTest}</Heading>
                <Text size="sm" weight="semibold">
                    {data.testStatus}
                </Text>
                <Text size="sm" tone="muted" live={data.refused ? "assertive" : undefined}>
                    {data.applyHint}
                </Text>
                <Button
                    variant="primary"
                    isPending={data.ownPending}
                    isDisabled={data.actionDisabled}
                    onPress={props.on.apply}
                >
                    {data.applyLabel}
                </Button>
            </div>
        </SurfaceCard>
    )
}
