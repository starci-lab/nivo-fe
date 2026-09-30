import { type AccountingOperationAnswer, type AccountingResult } from "@/modules/api/accounting"
import type { useAccountingWorkbenchContext } from "./useAccountingWorkbenchContext"
import type { useAccountingWorkbenchFeedback } from "./useAccountingWorkbenchFeedback"
type CommandAnswer = AccountingOperationAnswer<AccountingResult>

/** Own the AccountingWorkbenchIntakeActions handlers. */
export const useAccountingWorkbenchIntakeActions = (
    context: ReturnType<typeof useAccountingWorkbenchContext>,
    feedback: ReturnType<typeof useAccountingWorkbenchFeedback>,
) => {
    const {
        admit,
        evidence,
        evidenceId,
        evidenceIds,
        fingerprint,
        intakeRevision,
        intentId,
        itemId,
        itemRevision,
        newAttemptId,
        notStartedProofRef,
        oldAttemptId,
        policyRevision,
        ready,
        routine,
        routineCommand,
        sourceKind,
        sourceRef,
        sourceRevision,
    } = context
    const { evidenceStateText, routineStateText, success, workbenchCommand } = feedback
    const onAdmit = () => {
        if (
            !ready ||
            evidenceId.length === 0 ||
            sourceKind.length === 0 ||
            sourceRef.length === 0 ||
            sourceRevision.length === 0 ||
            fingerprint.length === 0
        )
            return
        const value = {
            evidenceId,
            sourceKind,
            sourceRef,
            sourceRevision,
            fingerprint,
            expectedRevision: Number(intakeRevision),
        }
        const key = `admit-${evidenceId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => admit.trigger({ requestId, input: value }),
            readback: () => evidence.mutate(),
            describe: (answer) => success(evidenceStateText(answer)),
        })
    }
    const onCommitRoutine = () => {
        if (!ready || intentId.length === 0 || itemId.length === 0 || policyRevision.length === 0) return
        const value = {
            action: "commit" as const,
            itemId,
            evidenceIds: evidenceIds
                .split(",")
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0),
            intentId,
            policyRevision,
            expectedItemRevision: Number(itemRevision),
        }
        const key = `routine-${intentId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => routineCommand.trigger({ requestId, input: value }),
            readback: () => routine.mutate(),
            describe: (answer) => success(routineStateText(answer)),
        })
    }
    const onRetryRoutine = () => {
        if (
            !ready ||
            intentId.length === 0 ||
            oldAttemptId.length === 0 ||
            notStartedProofRef.length === 0 ||
            newAttemptId.length === 0
        )
            return
        const value = { action: "retry" as const, intentId, oldAttemptId, notStartedProofRef, newAttemptId }
        const key = `routine-retry-${intentId}`
        void workbenchCommand.settle<CommandAnswer>({
            key,
            value,
            press: (requestId) => routineCommand.trigger({ requestId, input: value }),
            readback: () => routine.mutate(),
            describe: (answer) => success(routineStateText(answer)),
        })
    }
    return { onAdmit, onCommitRoutine, onRetryRoutine }
}
