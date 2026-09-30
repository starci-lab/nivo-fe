import type { ReactNode } from "react"
import type { AccountingSurfaceStanding } from "@/modules/accounting/accounting-workbench"
import { Badge, Button, Input, SurfaceCard, Text } from "@starci/grammar/common"
import { accountingCorrectionStateKey } from "@/modules/accounting/accounting-workbench"
import {
    AccountingWorkbenchActionRow,
    AccountingWorkbenchFieldStack,
    AccountingWorkbenchRow,
} from "./accounting-workbench.shared"
import {
    ACCOUNTING_CORRECTION_TONES,
    accountingSubmitOn,
    accountingToneFor,
} from "./accounting-workbench.helpers"
import { ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME, ACCOUNTING_FORM_GRID_CLASS_NAME } from "./classNames"
import type { AccountingWorkbenchSectionData } from "./accounting-workbench.types"
import { AccountingWorkbenchRegion } from "./accounting-workbench.shared"

/** Props for the correction accounting workbench unit. */
type AccountingWorkbenchCorrectionProps = { readonly props: AccountingWorkbenchSectionData }

/** Draw the correction accounting workbench section from settled view data. */
export const AccountingWorkbenchCorrection = (props: AccountingWorkbenchCorrectionProps) => {
    const { view, shared, scopeReady } = props.props
    const { t } = view
    const amount = view.format.amount

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
        <SurfaceCard label={t("correction.label")}>
            <form onSubmit={accountingSubmitOn(view.correction.onPropose)}>
                <div className={ACCOUNTING_FORM_GRID_CLASS_NAME}>
                    <Input
                        id="accounting-correction-id"
                        name="accounting-correction-id"
                        label={t("correction.correctionId")}
                        value={view.correction.correctionId}
                        onValueChange={view.correction.setCorrectionId}
                        isRequired
                    />
                    <Input
                        id="accounting-predecessor"
                        name="accounting-predecessor"
                        label={t("correction.predecessorResultId")}
                        hint={t("correction.predecessorHint")}
                        value={view.correction.predecessorResultId}
                        onValueChange={view.correction.setPredecessorResultId}
                        isRequired
                    />
                    <Input
                        id="accounting-corrected-amount"
                        name="accounting-corrected-amount"
                        label={t("correction.correctedAmount")}
                        value={view.correction.correctedAmount}
                        onValueChange={view.correction.setCorrectedAmount}
                    />
                    <Input
                        id="accounting-corrected-counterparty"
                        name="accounting-corrected-counterparty"
                        label={t("correction.correctedCounterparty")}
                        value={view.correction.correctedCounterparty}
                        onValueChange={view.correction.setCorrectedCounterparty}
                    />
                    <Input
                        id="accounting-correction-reason"
                        name="accounting-correction-reason"
                        label={t("correction.reason")}
                        value={view.correction.reason}
                        onValueChange={view.correction.setReason}
                        isRequired
                    />
                    <Input
                        id="accounting-correction-evidence"
                        name="accounting-correction-evidence"
                        label={t("correction.evidenceRefs")}
                        hint={t("evidenceIdsHint")}
                        value={view.correction.evidenceRefs}
                        onValueChange={view.correction.setEvidenceRefs}
                    />
                    <Input
                        id="accounting-correction-revision"
                        name="accounting-correction-revision"
                        label={t("correction.expectedResultRevision")}
                        value={view.correction.correctionRevision}
                        onValueChange={view.correction.setCorrectionRevision}
                        isRequired
                    />
                    <div className={ACCOUNTING_FORM_FULL_SPAN_CLASS_NAME}>
                        <AccountingWorkbenchActionRow>
                            <Button
                                size="lg"
                                type="submit"
                                variant="primary"
                                isPending={view.correction.isCorrecting}
                                isDisabled={
                                    !scopeReady ||
                                    view.correction.correctionId.length === 0 ||
                                    view.correction.predecessorResultId.length === 0 ||
                                    view.correction.reason.length === 0
                                }
                            >
                                {t("correction.propose")}
                            </Button>
                            <Button size="lg" type="button" variant="ghost" onPress={view.correction.reload}>
                                {t("reload")}
                            </Button>
                        </AccountingWorkbenchActionRow>
                    </div>
                </div>
            </form>
            <form onSubmit={accountingSubmitOn(view.correction.onAppend)}>
                <AccountingWorkbenchFieldStack>
                    <Text size="xs" tone="muted">
                        {t("correction.appendHint")}
                    </Text>
                    <Input
                        id="accounting-append-attempt"
                        name="accounting-append-attempt"
                        label={t("correction.attemptId")}
                        value={view.correction.appendAttemptId}
                        onValueChange={view.correction.setAppendAttemptId}
                    />
                    <Button
                        size="lg"
                        type="submit"
                        variant="secondary"
                        isPending={view.correction.isCorrecting}
                        isDisabled={
                            !scopeReady ||
                            view.correction.correctionId.length === 0 ||
                            view.correction.appendAttemptId.length === 0
                        }
                    >
                        {t("correction.append")}
                    </Button>
                </AccountingWorkbenchFieldStack>
            </form>
            {region(
                view.correction.standing,
                t("correction.empty"),
                t("correction.emptyHint"),
                <AccountingWorkbenchFieldStack>
                    {view.correction.predecessor === null ? null : (
                        <AccountingWorkbenchRow>
                            <Text size="sm" weight="semibold">
                                {t("correction.original")}
                            </Text>
                            <Text size="sm">
                                {view.correction.predecessor.resultId} ·{" "}
                                {view.correction.predecessor.facts.amountMinor === null ||
                                view.correction.predecessor.facts.currency === null
                                    ? t("none")
                                    : amount(
                                          view.correction.predecessor.facts.amountMinor,
                                          view.correction.predecessor.facts.currency,
                                      )}{" "}
                                · {view.correction.predecessor.facts.counterpartyRef ?? t("none")}
                            </Text>
                            <Text size="xs" tone="accent">
                                {t("correction.originalUnchanged")}
                            </Text>
                        </AccountingWorkbenchRow>
                    )}
                    {view.correction.model === null ? null : (
                        <AccountingWorkbenchRow>
                            <Text size="sm" weight="semibold">
                                {view.correction.model.correctionId}
                            </Text>
                            <AccountingWorkbenchActionRow>
                                <Badge tone={accountingToneFor(ACCOUNTING_CORRECTION_TONES, view.correction.model.state)}>
                                    {t(accountingCorrectionStateKey(view.correction.model.state))}
                                </Badge>
                                <Text size="sm">
                                    {t("correction.lineage", {
                                        predecessor: view.correction.model.predecessorResultId ?? t("none"),
                                        result: view.correction.model.resultId ?? t("none"),
                                    })}
                                </Text>
                            </AccountingWorkbenchActionRow>
                            {view.correction.model.state === "applied" && view.correction.model.resultId !== null ? (
                                <Text size="sm" tone="accent">
                                    {t("correction.appended", { result: view.correction.model.resultId })}
                                </Text>
                            ) : null}
                            {view.correction.model.state === "outcome_unknown" ||
                            view.correction.model.state === "possible_start" ? (
                                <Text size="sm" tone="accent" live="polite">
                                    {t("correction.unknownNotice")}
                                </Text>
                            ) : null}
                        </AccountingWorkbenchRow>
                    )}
                </AccountingWorkbenchFieldStack>,
            )}
        </SurfaceCard>
    )
}
