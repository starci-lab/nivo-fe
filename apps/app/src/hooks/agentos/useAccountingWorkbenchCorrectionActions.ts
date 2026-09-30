import {
    type AccountingCorrectedFact,
    type AccountingOperationAnswer,
    type AccountingResult,
} from "@/modules/api/accounting"
import type { useAccountingWorkbenchContext } from "./useAccountingWorkbenchContext"
import type { useAccountingWorkbenchFeedback } from "./useAccountingWorkbenchFeedback"
type CommandAnswer = AccountingOperationAnswer<AccountingResult>

/** Own the AccountingWorkbenchCorrectionActions handlers. */
export const useAccountingWorkbenchCorrectionActions = (
    context: ReturnType<typeof useAccountingWorkbenchContext>,
    feedback: ReturnType<typeof useAccountingWorkbenchFeedback>,
) => {
    const {
        appendAttemptId,
        correctedAmount,
        correctedCounterparty,
        correction,
        correctionEvidenceRefs,
        correctionId,
        correctionReason,
        correctionRevision,
        currency,
        detail,
        detailModel,
        predecessorResultId,
        ready,
        resultId,
    } = context
    const { correctionStateText, success, workbenchCommand } = feedback
    const correctedFacts = (): ReadonlyArray<AccountingCorrectedFact> => {
        const facts: Array<AccountingCorrectedFact> = []
        if (correctedAmount.trim().length > 0) {
            const minor = Number(correctedAmount.trim())
            facts.push({
                field: "amountMinor",
                oldValue:
                    detailModel?.resultId === predecessorResultId &&
                    detailModel.facts.amountMinor !== null &&
                    detailModel.facts.currency !== null
                        ? {
                              kind: "money",
                              amountMinor: detailModel.facts.amountMinor,
                              currency: detailModel.facts.currency,
                          }
                        : null,
                newValue: Number.isInteger(minor)
                    ? { kind: "money", amountMinor: minor, currency: detailModel?.facts.currency ?? currency ?? "" }
                    : null,
                evidenceRefs: correctionEvidenceRefs
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter((entry) => entry.length > 0),
            })
        }
        if (correctedCounterparty.trim().length > 0) {
            const priorCounterparty = detailModel?.facts.counterpartyRef ?? null
            facts.push({
                field: "counterpartyRef",
                oldValue: priorCounterparty === null ? null : { kind: "text", value: priorCounterparty },
                newValue: { kind: "text", value: correctedCounterparty.trim() },
                evidenceRefs: correctionEvidenceRefs
                    .split(",")
                    .map((entry) => entry.trim())
                    .filter((entry) => entry.length > 0),
            })
        }
        return facts
    }
    const onProposeCorrection = () => {
        const facts = correctedFacts()
        if (
            !ready ||
            correctionId.length === 0 ||
            predecessorResultId.length === 0 ||
            facts.length === 0 ||
            correctionReason.length === 0
        )
            return
        const value = {
            action: "propose" as const,
            correctionId,
            predecessorResultId,
            correctedFacts: facts,
            reason: correctionReason,
            evidenceRefs: correctionEvidenceRefs
                .split(",")
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0),
            expectedResultRevision: Number(correctionRevision),
        }
        const key = `correct-${correctionId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => correction.trigger({ requestId, input: value }),
            readback: () => detail.mutate(),
            describe: (answer) => success(correctionStateText(answer)),
        })
    }
    const onAppendCorrection = () => {
        if (!ready || correctionId.length === 0 || appendAttemptId.length === 0) return
        const value = {
            action: "append" as const,
            correctionId,
            attemptId: appendAttemptId,
            expectedRevision: Number(correctionRevision),
        }
        const key = `correct-append-${correctionId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => correction.trigger({ requestId, input: value }),
            readback: () => detail.mutate(),
            describe: (answer) => success(correctionStateText(answer)),
        })
    }

    return { onAppendCorrection, onProposeCorrection }
}
