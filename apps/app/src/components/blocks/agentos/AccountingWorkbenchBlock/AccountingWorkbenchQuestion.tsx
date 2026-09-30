import type { ReactNode } from "react"
import type { AccountingSurfaceStanding } from "@/modules/accounting/accounting-workbench"
import { Badge, Button, Input, SurfaceCard, Text } from "@starci/grammar/common"
import { accountingExceptionStateKey, accountingRoutineStateKey } from "@/modules/accounting/accounting-workbench"
import { AccountingWorkbenchActionRow, AccountingWorkbenchFieldStack } from "./accounting-workbench.shared"
import { accountingSubmitOn } from "./accounting-workbench.helpers"
import type { AccountingWorkbenchSectionData } from "./accounting-workbench.types"
import { AccountingWorkbenchRegion } from "./accounting-workbench.shared"

/** Props for the question accounting workbench unit. */
type AccountingWorkbenchQuestionProps = { readonly props: AccountingWorkbenchSectionData }

/** Draw the question accounting workbench section from settled view data. */
export const AccountingWorkbenchQuestion = (props: AccountingWorkbenchQuestionProps) => {
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
        <SurfaceCard
            label={t("question.label")}
            fact={
                view.question.routineState === null
                    ? undefined
                    : t(accountingRoutineStateKey(view.question.routineState))
            }
        >
            {region(
                view.question.standing,
                t("question.empty"),
                t("question.emptyHint"),
                <AccountingWorkbenchFieldStack>
                    <Text size="sm" weight="semibold">
                        {t("question.why")}
                    </Text>
                    <Text size="sm">
                        {view.question.routineReason === null
                            ? t("question.whyUnknown")
                            : t("question.whyReason", { reason: view.question.routineReason })}
                    </Text>
                    <Text size="xs" tone="muted">
                        {t("question.attention", {
                            codes:
                                view.question.attention.length === 0 ? t("none") : view.question.attention.join(", "),
                        })}
                    </Text>
                    <Text size="sm" weight="semibold">
                        {t("question.evidence")}
                    </Text>
                    <Text size="sm">
                        {view.question.itemEvidenceRefs.length === 0
                            ? t("question.evidenceAbsent")
                            : view.question.itemEvidenceRefs.join(", ")}
                    </Text>
                    <Text size="sm" weight="semibold">
                        {t("question.alternatives")}
                    </Text>
                    <Text size="sm">{t("question.consequence")}</Text>
                    <form onSubmit={accountingSubmitOn(view.question.onAnswer)}>
                        <AccountingWorkbenchFieldStack>
                            <Input
                                id="accounting-exception-id"
                                name="accounting-exception-id"
                                label={t("question.exceptionId")}
                                hint={t("question.exceptionIdHint")}
                                value={view.question.exceptionId}
                                onValueChange={view.question.setExceptionId}
                                isRequired
                            />
                            <Input
                                id="accounting-choice-code"
                                name="accounting-choice-code"
                                label={t("question.choiceCode")}
                                value={view.question.choiceCode}
                                onValueChange={view.question.setChoiceCode}
                            />
                            <Input
                                id="accounting-question-reason"
                                name="accounting-question-reason"
                                label={t("question.reason")}
                                value={view.question.reason}
                                onValueChange={view.question.setReason}
                            />
                            <Input
                                id="accounting-question-evidence"
                                name="accounting-question-evidence"
                                label={t("question.answerEvidenceRefs")}
                                hint={t("evidenceIdsHint")}
                                value={view.question.evidenceRefs}
                                onValueChange={view.question.setEvidenceRefs}
                            />
                            <Input
                                id="accounting-exception-revision"
                                name="accounting-exception-revision"
                                label={t("question.expectedRevision")}
                                value={view.question.exceptionRevision}
                                onValueChange={view.question.setExceptionRevision}
                                isRequired
                            />
                            <AccountingWorkbenchActionRow>
                                <Button
                                    size="lg"
                                    type="submit"
                                    variant="primary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={
                                        !scopeReady ||
                                        view.question.exceptionId.length === 0 ||
                                        (view.question.choiceCode.length === 0 && view.question.reason.length === 0)
                                    }
                                >
                                    {t("question.answer")}
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="secondary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={!scopeReady || view.question.exceptionId.length === 0}
                                    onPress={view.question.onDefer}
                                >
                                    {t("question.defer")}
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="secondary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={!scopeReady || view.question.exceptionId.length === 0}
                                    onPress={view.question.onReopen}
                                >
                                    {t("question.reopen")}
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="secondary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={!scopeReady || view.question.exceptionId.length === 0}
                                    onPress={view.question.onEscalate}
                                >
                                    {t("question.escalate")}
                                </Button>
                                <Button
                                    size="lg"
                                    type="button"
                                    variant="secondary"
                                    isPending={view.question.isAnswering}
                                    isDisabled={!scopeReady || view.question.exceptionId.length === 0}
                                    onPress={view.question.onDismiss}
                                >
                                    {t("question.dismiss")}
                                </Button>
                            </AccountingWorkbenchActionRow>
                        </AccountingWorkbenchFieldStack>
                    </form>
                    {view.question.answerState === null ? null : (
                        <AccountingWorkbenchActionRow>
                            <Text size="sm">
                                {view.question.answerState.state === "answered" ||
                                view.question.answerState.state === "resolved"
                                    ? t("question.settled")
                                    : t("question.pending")}
                            </Text>
                            <Badge
                                tone={
                                    view.question.answerState.state === "answered" ||
                                    view.question.answerState.state === "resolved"
                                        ? "success"
                                        : "warning"
                                }
                            >
                                {t(accountingExceptionStateKey(view.question.answerState.state))}
                            </Badge>
                        </AccountingWorkbenchActionRow>
                    )}
                    {view.question.answerState === null ||
                    view.question.answerState.state === "open" ||
                    view.question.answerState.state === "deferred" ||
                    view.question.answerState.state === "dismissed" ? null : (
                        <Text size="xs" tone="accent">
                            {t("question.consequenceHeld")}
                        </Text>
                    )}
                </AccountingWorkbenchFieldStack>,
            )}
        </SurfaceCard>
    )
}
