import {
    type AccountingExceptionInput,
    type AccountingOperationAnswer,
    type AccountingResult,
} from "@/modules/api/accounting"
import type { useAccountingWorkbenchContext } from "./useAccountingWorkbenchContext"
import type { useAccountingWorkbenchFeedback } from "./useAccountingWorkbenchFeedback"
type CommandAnswer = AccountingOperationAnswer<AccountingResult>

/** Own the AccountingWorkbenchExceptionActions handlers. */
export const useAccountingWorkbenchExceptionActions = (
    context: ReturnType<typeof useAccountingWorkbenchContext>,
    feedback: ReturnType<typeof useAccountingWorkbenchFeedback>,
) => {
    const {
        choiceCode,
        exceptionCommand,
        exceptionId,
        exceptionRevision,
        intentId,
        questionEvidenceRefs,
        questionReason,
        ready,
        routine,
    } = context
    const { routineStateText, success, workbenchCommand } = feedback
    const questionEvidence = questionEvidenceRefs
        .split(",")
        .map((entry: string): string => entry.trim())
        .filter((entry: string): boolean => entry.length > 0)
    const exceptionAction = (action: "defer" | "reopen" | "escalate" | "dismiss") => {
        if (!ready || exceptionId.length === 0) return
        const value: AccountingExceptionInput = {
            action,
            exceptionId,
            reason: questionReason,
            expectedRevision: Number(exceptionRevision),
        }
        const key = `exception-${action}-${exceptionId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => exceptionCommand.trigger({ requestId, input: value }),
            readback: intentId.length > 0 ? () => routine.mutate() : null,
            describe: (answer) => success(routineStateText(answer)),
        })
    }
    const onAnswerQuestion = () => {
        if (!ready || exceptionId.length === 0 || (choiceCode.length === 0 && questionReason.length === 0)) return
        const value: AccountingExceptionInput = {
            action: "answer",
            exceptionId,
            answer: {
                choiceCode: choiceCode.length === 0 ? null : choiceCode,
                suppliedFacts: [],
                reason: questionReason.length === 0 ? null : questionReason,
            },
            answerEvidenceRefs: questionEvidence,
            expectedRevision: Number(exceptionRevision),
        }
        const key = `exception-answer-${exceptionId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => exceptionCommand.trigger({ requestId, input: value }),
            readback: intentId.length > 0 ? () => routine.mutate() : null,
            describe: (answer) => success(routineStateText(answer)),
        })
    }
    return { exceptionAction, onAnswerQuestion }
}
