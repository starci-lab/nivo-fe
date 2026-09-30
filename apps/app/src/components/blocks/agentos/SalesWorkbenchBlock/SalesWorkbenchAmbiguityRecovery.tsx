import type { ReactNode } from "react"
import { SalesWorkbenchActionRow, SalesWorkbenchFieldStack, SalesWorkbenchRegion, SalesWorkbenchRow } from "./sales-workbench.shared"
import type { SalesWorkbenchSectionProps } from "./sales-workbench.types"
import { Badge, Button, Input, Select, SurfaceCard, Text } from "@starci/grammar/common"
import { salesWorkbenchActionText, salesWorkbenchSubmitOn } from "./sales-workbench.helpers"
import { SALES_FORM_FULL_SPAN_CLASS_NAME, SALES_FORM_GRID_CLASS_NAME, SALES_OPERATIONS_GRID_CLASS_NAME } from "./classNames"

/** Props for the ambiguous actions and recovery Sales workbench unit. */
type SalesWorkbenchAmbiguityRecoveryProps = SalesWorkbenchSectionProps

/** Draw the ambiguous actions and recovery Sales workbench unit from settled view data. */
export const SalesWorkbenchAmbiguityRecovery = (props: SalesWorkbenchAmbiguityRecoveryProps) => {
    const { view, format, shared } = props.props
    const { t, scopeReady } = view
    const { setFactKind } = props.on
    const actionText = (status: string) => salesWorkbenchActionText(status, t)
    const ambiguity = () => (
        <SurfaceCard label={t("ambiguity.label")}>
            <form onSubmit={salesWorkbenchSubmitOn(view.ambiguity.onClarify)}>
                <SalesWorkbenchFieldStack>
                    <Text size="sm" weight="semibold">
                        {t("ambiguity.question")}
                    </Text>
                    <Text size="sm">
                        {view.ambiguity.clarification === null
                            ? t("ambiguity.noQuestion")
                            : JSON.stringify(view.ambiguity.clarification)}
                    </Text>
                    <Select
                        name="sales-fact-kind"
                        label={t("ambiguity.fact")}
                        options={[
                            { id: "opportunityId", label: t(salesClarificationFactKey({ opportunityId: "x" })) },
                            { id: "customerRef", label: t(salesClarificationFactKey({ customerRef: "x" })) },
                        ]}
                        value={view.ambiguity.factKind}
                        onValueChange={(value) =>
                            setFactKind(value === "customerRef" ? "customerRef" : "opportunityId")
                        }
                    />
                    <Input
                        id="sales-fact-value"
                        name="sales-fact-value"
                        label={t("ambiguity.factValue")}
                        hint={t("ambiguity.factValueHint")}
                        value={view.ambiguity.factValue}
                        onValueChange={view.ambiguity.setFactValue}
                        isRequired
                    />
                    <Input
                        id="sales-clarification-revision"
                        name="sales-clarification-revision"
                        label={t("ambiguity.revision")}
                        hint={t("ambiguity.revisionHint")}
                        value={view.ambiguity.revision}
                        onValueChange={view.ambiguity.setRevision}
                        isRequired
                    />
                    <SalesWorkbenchActionRow>
                        <Button
                            size="lg"
                            type="submit"
                            variant="primary"
                            isPending={view.ambiguity.isClarifying}
                            isDisabled={!scopeReady || !view.ambiguity.addressable}
                        >
                            {t("ambiguity.answer")}
                        </Button>
                    </SalesWorkbenchActionRow>
                </SalesWorkbenchFieldStack>
            </form>
            {view.ambiguity.standing === "loading" ? null : (
                <Text size="xs" tone="muted">
                    {t("ambiguity.pendingNote")}
                </Text>
            )}
        </SurfaceCard>
    )
    const recovery = () => (
        <SurfaceCard
            label={t("recovery.label")}
            fact={
                view.routine.door === "hold"
                    ? t("recovery.hold")
                    : t("recovery.door", { door: t(`recovery.${view.routine.door}`) })
            }
        >
            <form onSubmit={salesWorkbenchSubmitOn(view.routine.onRetry)}>
                <SalesWorkbenchFieldStack>
                    <SalesWorkbenchActionRow>
                        <Input
                            id="sales-action-id"
                            name="sales-action-id"
                            label={t("routine.actionId")}
                            hint={t("routine.actionIdsHint", {
                                actions:
                                    view.routine.actionIds.length === 0 ? t("none") : view.routine.actionIds.join(", "),
                            })}
                            value={view.routine.actionId}
                            onValueChange={view.routine.setActionId}
                            isRequired
                        />
                        <Input
                            id="sales-attempt-generation"
                            name="sales-attempt-generation"
                            label={t("routine.attemptLabel")}
                            value={view.routine.attemptGeneration}
                            onValueChange={view.routine.setAttemptGeneration}
                            isRequired
                        />
                    </SalesWorkbenchActionRow>
                    <Input
                        id="sales-action-revision"
                        name="sales-action-revision"
                        label={t("routine.expectedRevision")}
                        value={view.routine.revision}
                        onValueChange={view.routine.setRevision}
                        isRequired
                    />
                    <Text size="sm" weight="semibold">
                        {t("recovery.proof")}
                    </Text>
                    <Text size="sm">{view.routine.attestedProof ?? t("recovery.noProof")}</Text>
                    <Text size="xs" tone="muted">
                        {t("recovery.fence", {
                            fence:
                                view.routine.attestedFence === null
                                    ? t("none")
                                    : view.routine.attestedFence.claimTokenHash,
                        })}
                    </Text>
                    <Input
                        id="sales-receiver-intent"
                        name="sales-receiver-intent"
                        label={t("recovery.receiverIntent")}
                        value={view.routine.receiverIntentId}
                        onValueChange={view.routine.setReceiverIntentId}
                    />
                    <Input
                        id="sales-receiver-attempt"
                        name="sales-receiver-attempt"
                        label={t("recovery.receiverAttempt")}
                        value={view.routine.receiverAttemptId}
                        onValueChange={view.routine.setReceiverAttemptId}
                    />
                    <Input
                        id="sales-recovery-fingerprint"
                        name="sales-recovery-fingerprint"
                        label={t("recovery.fingerprint")}
                        hint={t("recovery.fingerprintHint")}
                        value={view.routine.fingerprint}
                        onValueChange={view.routine.setFingerprint}
                    />
                    <SalesWorkbenchActionRow>
                        <Button
                            size="lg"
                            type="submit"
                            variant="primary"
                            isPending={view.routine.isRecovering}
                            isDisabled={!scopeReady || !view.routine.addressable || view.routine.door !== "retry"}
                        >
                            {t("recovery.retry")}
                        </Button>
                        <Button
                            size="lg"
                            type="button"
                            variant="secondary"
                            isPending={view.routine.isRecovering}
                            isDisabled={!scopeReady || !view.routine.addressable || view.routine.door !== "retry"}
                            onPress={view.routine.onStop}
                        >
                            {t("recovery.stop")}
                        </Button>
                    </SalesWorkbenchActionRow>
                    <Text size="xs" tone="muted">
                        {t("recovery.doorNote")}
                    </Text>
                </SalesWorkbenchFieldStack>
            </form>
        </SurfaceCard>
    )

    return <div className={SALES_OPERATIONS_GRID_CLASS_NAME}>{ambiguity()}{recovery()}</div>
}
