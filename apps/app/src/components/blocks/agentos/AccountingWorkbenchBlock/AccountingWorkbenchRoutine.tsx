import type { ReactNode } from "react"
import type { AccountingSurfaceStanding } from "@/modules/accounting/accounting-workbench"
import { Badge, Button, Input, SurfaceCard, Text } from "@starci/grammar/common"
import { accountingRoutineStateKey } from "@/modules/accounting/accounting-workbench"
import {
    AccountingWorkbenchActionRow,
    AccountingWorkbenchFieldStack,
    AccountingWorkbenchRow,
} from "./accounting-workbench.shared"
import { ACCOUNTING_ROUTINE_TONES, accountingToneFor, accountingSubmitOn } from "./accounting-workbench.helpers"
import { ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME, ACCOUNTING_FORM_GRID_CLASS_NAME } from "./classNames"
import type { AccountingWorkbenchSectionData } from "./accounting-workbench.types"
import { AccountingWorkbenchRegion } from "./accounting-workbench.shared"

/** Props for the routine accounting workbench unit. */
type AccountingWorkbenchRoutineProps = { readonly props: AccountingWorkbenchSectionData }

/** Draw the routine accounting workbench section from settled view data. */
export const AccountingWorkbenchRoutine = (props: AccountingWorkbenchRoutineProps) => {
    const { view, shared, scopeReady } = props.props
    const { t } = view

    const region = (
        standing: AccountingSurfaceStanding,
        empty: string,
        emptyHint: string,
        children: ReactNode,
    ) => (
        <AccountingWorkbenchRegion
            props={{ view, shared, scopeReady, standing, empty, emptyHint }}
        >
            {children}
        </AccountingWorkbenchRegion>
    )
    return (
        <SurfaceCard label={t("routine.label")}>
            <form onSubmit={accountingSubmitOn(view.routine.onCommitRoutine)}>
                <div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="accounting-intent-id"
                        name="accounting-intent-id"
                        label={t("routine.intentId")}
                        value={view.routine.intentId}
                        onValueChange={view.routine.setIntentId}
                        isRequired
                    />
                    <Input
                        id="accounting-item-id"
                        name="accounting-item-id"
                        label={t("routine.itemId")}
                        value={view.routine.itemId}
                        onValueChange={view.routine.setItemId}
                        isRequired
                    />
                    <Input
                        id="accounting-policy-revision"
                        name="accounting-policy-revision"
                        label={t("routine.policyRevision")}
                        value={view.routine.policyRevision}
                        onValueChange={view.routine.setPolicyRevision}
                        isRequired
                    />
                    <Input
                        id="accounting-evidence-ids"
                        name="accounting-evidence-ids"
                        label={t("routine.evidenceIds")}
                        hint={t("routine.evidenceIdsHint")}
                        value={view.routine.evidenceIds}
                        onValueChange={view.routine.setEvidenceIds}
                        isRequired
                    />
                    <Input
                        id="accounting-item-revision"
                        name="accounting-item-revision"
                        label={t("routine.itemRevision")}
                        value={view.routine.itemRevision}
                        onValueChange={view.routine.setItemRevision}
                        isRequired
                    />
                    <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}>
                        <AccountingWorkbenchActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.routine.isCommitting}
                                isDisabled={
                                    !scopeReady ||
                                    view.routine.intentId.length === 0 ||
                                    view.routine.itemId.length === 0 ||
                                    view.routine.policyRevision.length === 0
                                }
                            >
                                {t("routine.commit")}
                            </Button>
                            <Button size="lg" type="button" variant="ghost" onPress={view.routine.reload}>
                                {t("reload")}
                            </Button>
                        </AccountingWorkbenchActionRow>
                    </div>
                </div>
            </form>
            {region(
                view.routine.standing,
                t("routine.empty"),
                t("routine.emptyHint"),
                view.routine.model === null ? null : (
                    <AccountingWorkbenchRow>
                        <AccountingWorkbenchActionRow>
                            <Text weight="semibold">{view.routine.model.intentId}</Text>
                            <Badge tone={accountingToneFor(ACCOUNTING_ROUTINE_TONES, view.routine.model.state)}>
                                {t(accountingRoutineStateKey(view.routine.model.state))}
                            </Badge>
                            {view.routine.model.reasonCode === null ? null : (
                                <Badge tone="neutral">{view.routine.model.reasonCode}</Badge>
                            )}
                        </AccountingWorkbenchActionRow>
                        <Text size="sm">
                            {t("routine.readback", {
                                item: view.routine.model.itemId ?? t("none"),
                                attempt: view.routine.model.attemptId ?? t("none"),
                            })}
                        </Text>
                        {view.routine.model.receiptId === null ? null : (
                            <Text size="xs" tone="muted">
                                {t("routine.receipt", {
                                    receipt: view.routine.model.receiptId,
                                    result: view.routine.model.resultId ?? t("none"),
                                })}
                            </Text>
                        )}
                        {view.routine.model.state === "outcome-unknown" ? (
                            <Text size="sm" tone="accent" live="polite">
                                {t("routine.unknownNotice")}
                            </Text>
                        ) : null}
                    </AccountingWorkbenchRow>
                ),
            )}
            <form onSubmit={accountingSubmitOn(view.routine.onRetryRoutine)}>
                <AccountingWorkbenchFieldStack>
                    <Text size="xs" tone="muted">
                        {t("routine.retryHint")}
                    </Text>
                    <Input
                        id="accounting-old-attempt"
                        name="accounting-old-attempt"
                        label={t("routine.oldAttemptId")}
                        value={view.routine.oldAttemptId}
                        onValueChange={view.routine.setOldAttemptId}
                    />
                    <Input
                        id="accounting-not-started-proof"
                        name="accounting-not-started-proof"
                        label={t("routine.notStartedProofRef")}
                        value={view.routine.notStartedProofRef}
                        onValueChange={view.routine.setNotStartedProofRef}
                    />
                    <Input
                        id="accounting-new-attempt"
                        name="accounting-new-attempt"
                        label={t("routine.newAttemptId")}
                        value={view.routine.newAttemptId}
                        onValueChange={view.routine.setNewAttemptId}
                    />
                    <Button
                        size="lg"
                        type="submit"
                        variant="secondary"
                        isPending={view.routine.isCommitting}
                        isDisabled={
                            !scopeReady ||
                            view.routine.intentId.length === 0 ||
                            view.routine.oldAttemptId.length === 0 ||
                            view.routine.notStartedProofRef.length === 0 ||
                            view.routine.newAttemptId.length === 0
                        }
                    >
                        {t("routine.retry")}
                    </Button>
                </AccountingWorkbenchFieldStack>
            </form>
        </SurfaceCard>
    )
}
