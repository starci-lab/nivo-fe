import { parseAccountingExceptionReading } from "@/modules/api/accounting/payload.guards"
import { accountingSurfaceStanding } from "@/modules/accounting/accounting-workbench"
import type { useAccountingWorkbenchContext } from "./useAccountingWorkbenchContext"
import type { AccountingWorkbenchActions } from "./useAccountingWorkbench"
/** Project the AccountingWorkbenchSecondaryRegions view model. */
export const useAccountingWorkbenchSecondaryRegions = (
    context: ReturnType<typeof useAccountingWorkbenchContext>,
    actions: AccountingWorkbenchActions,
) => {
    const {
        appendAttemptId,
        asOf,
        choiceCode,
        correctedAmount,
        correctedCounterparty,
        correction,
        correctionEvidenceRefs,
        correctionId,
        correctionModel,
        correctionReason,
        correctionRevision,
        detail,
        detailModel,
        exceptionCommand,
        exceptionId,
        exceptionRevision,
        itemId,
        predecessorResultId,
        questionEvidenceRefs,
        questionReason,
        ready,
        resultId,
        routine,
        routineModel,
        scopeStanding,
        setAppendAttemptId,
        setAsOf,
        setChoiceCode,
        setCorrectedAmount,
        setCorrectedCounterparty,
        setCorrectionEvidenceRefs,
        setCorrectionId,
        setCorrectionReason,
        setCorrectionRevision,
        setExceptionId,
        setExceptionRevision,
        setItemId,
        setPredecessorResultId,
        setQuestionEvidenceRefs,
        setQuestionReason,
        setResultId,
        summaryModel,
    } = context
    const { exceptionAction, onAnswerQuestion, onAppendCorrection, onProposeCorrection, workbenchCommand } = actions
    const attention =
        summaryModel === null ? [] : [...new Set(summaryModel.items.flatMap((item) => item.attentionCodes))]
    const onLoadDetail = () => {
        if (ready) void detail.mutate()
    }
    return {
        question: {
            standing: ready
                ? accountingSurfaceStanding(
                      routine.data,
                      routineModel !== null && routineModel.state === "needs-decision",
                  )
                : scopeStanding,
            exceptionId,
            setExceptionId,
            choiceCode,
            setChoiceCode,
            reason: questionReason,
            setReason: setQuestionReason,
            evidenceRefs: questionEvidenceRefs,
            setEvidenceRefs: setQuestionEvidenceRefs,
            exceptionRevision,
            setExceptionRevision,
            answerState:
                exceptionCommand.data?.ok === true
                    ? parseAccountingExceptionReading(exceptionCommand.data.data.payload)
                    : null,
            isAnswering:
                exceptionCommand.isMutating ||
                workbenchCommand.isPending(`exception-answer-${exceptionId}`) ||
                workbenchCommand.isPending(`exception-defer-${exceptionId}`) ||
                workbenchCommand.isPending(`exception-reopen-${exceptionId}`) ||
                workbenchCommand.isPending(`exception-escalate-${exceptionId}`) ||
                workbenchCommand.isPending(`exception-dismiss-${exceptionId}`),
            onAnswer: onAnswerQuestion,
            onDefer: () => exceptionAction("defer"),
            onReopen: () => exceptionAction("reopen"),
            onEscalate: () => exceptionAction("escalate"),
            onDismiss: () => exceptionAction("dismiss"),
            routineState: routineModel?.state ?? null,
            routineReason: routineModel?.reasonCode ?? null,
            attention,
            itemEvidenceRefs: summaryModel?.items.flatMap((item) => item.sourceEvidenceRefs) ?? [],
            reload: () => void routine.mutate(),
        },
        detail: {
            standing: ready ? accountingSurfaceStanding(detail.data, detailModel !== null) : scopeStanding,
            resultId,
            setResultId,
            itemId,
            setItemId: (value: string) => {
                setItemId(value)
                setAsOf(null)
            },
            asOfInstant: asOf ?? "",
            setAsOfInstant: (value: string) => setAsOf(value.length === 0 ? null : value),
            model: detailModel,
            isFetching: detail.isLoading,
            onLoad: onLoadDetail,
            retry: () => void detail.mutate(),
        },
        correction: {
            standing: ready ? accountingSurfaceStanding(correction.data, correctionModel !== null) : scopeStanding,
            correctionId,
            setCorrectionId,
            predecessorResultId,
            setPredecessorResultId,
            correctedAmount,
            setCorrectedAmount,
            correctedCounterparty,
            setCorrectedCounterparty,
            reason: correctionReason,
            setReason: setCorrectionReason,
            evidenceRefs: correctionEvidenceRefs,
            setEvidenceRefs: setCorrectionEvidenceRefs,
            correctionRevision,
            setCorrectionRevision,
            appendAttemptId,
            setAppendAttemptId,
            model: correctionModel,
            predecessor: detailModel?.resultId === predecessorResultId ? detailModel : null,
            isCorrecting:
                correction.isMutating ||
                workbenchCommand.isPending(`correct-${correctionId}`) ||
                workbenchCommand.isPending(`correct-append-${correctionId}`),
            onPropose: onProposeCorrection,
            onAppend: onAppendCorrection,
            reload: () => void detail.mutate(),
        },
    }
}
