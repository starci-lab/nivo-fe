import { type AccountingOperationAnswer, type AccountingResult } from "@/modules/api/accounting"
import { isCommandPayloadState } from "@/modules/api/accounting/payload.guards"
import { type AccountingCommandPayloadState } from "@/modules/api/accounting/payload.guards"
import { accountingRefusalKey } from "@/modules/accounting/accounting-workbench"
import { useWorkbenchCommand } from "./useWorkbenchCommand"
import type { useAccountingWorkbenchContext } from "./useAccountingWorkbenchContext"
/** The closed Accounting response the settlement flow receives from a command or readback. */
type CommandAnswer = AccountingOperationAnswer<AccountingResult>

/** The receiver's own state spelling inside one settled payload. */
const payloadState = (answer: CommandAnswer): AccountingCommandPayloadState | undefined =>
    answer.ok && isCommandPayloadState(answer.data.payload) ? answer.data.payload : undefined
/** The three states whose catalogue key differs from the receiver's spelling. */
const EVIDENCE_STATE_KEYS = {
    needs_information: "needsInformation",
    likely_duplicate: "likelyDuplicate",
} satisfies Readonly<Partial<Record<string, string>>>
const ROUTINE_STATE_KEYS = {
    "needs-decision": "needsDecision",
    "pending-authority": "pendingAuthority",
    "outcome-unknown": "outcomeUnknown",
} satisfies Readonly<Partial<Record<string, string>>>
const CORRECTION_STATE_KEYS = {
    possible_start: "possibleStart",
    proven_not_applied: "provenNotApplied",
    outcome_unknown: "outcomeUnknown",
} satisfies Readonly<Partial<Record<string, string>>>
const mappedState = (mapping: Readonly<Partial<Record<string, string>>>, state: string): string | undefined =>
    mapping[state]

/** Project the AccountingWorkbenchFeedback responsibility for one workbench. */
export const useAccountingWorkbenchFeedback = (context: ReturnType<typeof useAccountingWorkbenchContext>) => {
    const { t } = context
    const workbenchCommand = useWorkbenchCommand({
        refusal: (code, reason) => t(accountingRefusalKey(code), { reason }),
        unsettled: t("refusal.unsettled"),
        unreachable: t("refusal.unreachable"),
        acceptsFailedAnswer: (code) => code === "outcome_unknown",
    })

    const evidenceStateText = (answer: CommandAnswer): string | null => {
        const state = payloadState(answer)?.state
        return state === undefined
            ? null
            : t("intake.settled", { state: t(`evidenceState.${mappedState(EVIDENCE_STATE_KEYS, state) ?? state}`) })
    }
    const routineStateText = (answer: CommandAnswer): string | null => {
        const state = payloadState(answer)?.state
        return state === undefined
            ? null
            : t("routine.settled", { state: t(`routineState.${mappedState(ROUTINE_STATE_KEYS, state) ?? state}`) })
    }
    const correctionStateText = (answer: CommandAnswer): string | null => {
        const payload = payloadState(answer)
        return payload?.state === undefined
            ? null
            : t("correction.settled", {
                  state: t(`correctionState.${mappedState(CORRECTION_STATE_KEYS, payload.state) ?? payload.state}`),
                  result: payload.resultId ?? t("none"),
              })
    }
    const success = (message: string | null) => (message === null ? null : { kind: "success" as const, message })

    return { workbenchCommand, evidenceStateText, routineStateText, correctionStateText, success }
}
