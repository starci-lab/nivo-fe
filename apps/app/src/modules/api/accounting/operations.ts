import { operationAddress, sendOperation } from "../operation-route"
import { narrowOperationAnswer, refusal } from "./payload"
import type {
    AccountingAdmitEvidenceInput, AccountingCorrectInput, AccountingCorrectResult, AccountingEvidenceInput,
    AccountingEvidenceResult, AccountingExceptionInput, AccountingExceptionResult, AccountingInstallationScope,
    AccountingOperationAnswer, AccountingRequest, AccountingResult, AccountingResultDetailInput,
    AccountingResultDetailResult, AccountingRouteName, AccountingRoutineInput, AccountingRoutineResult,
    AccountingRoutineResultInput, AccountingSummaryQueryInput, AccountingSummaryResult,
} from "./types"


/**
 * Send exactly one operation request, and nothing else.
 *
 * One call is one request: no loop, no timer and no re-send on a refusal. The caller replays the SAME
 * stable identity if it decides to try again, which is what keeps a replay one intent.
 */
const sendAccountingOperation = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    operation: AccountingRouteName,
    request: AccountingRequest,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingResult>> => {
    const exchange = await sendOperation(accessToken, operationAddress(scope, operation), requestId, request)
    if (!exchange.arrived) return refusal(operation, exchange.code, exchange.reason, exchange.requestId)
    return narrowOperationAnswer(operation, requestId, exchange.body)
}

/** Read one evidence identity and its intake state. */
export const readAccountingEvidence = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    input: AccountingEvidenceInput,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingEvidenceResult>> => {
    const answer = await sendAccountingOperation(
        accessToken,
        scope,
        "accounting.evidence@1",
        { op: "evidence", input },
        requestId,
    )
    if (!answer.ok) return answer
    return answer.data.op === "admitEvidence" || answer.data.op === "evidence"
        ? { ok: true, data: answer.data }
        : refusal(
              "accounting.evidence@1",
              "UNEXPECTED_RESULT_TAG",
              "The receiver answered a non-evidence variant.",
              requestId,
          )
}

/** Read the stable state of one routine intent, the only read an uncertain routine is reconciled by. */
export const readAccountingRoutineResult = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    input: AccountingRoutineResultInput,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingRoutineResult>> => {
    const answer = await sendAccountingOperation(
        accessToken,
        scope,
        "accounting.routineResult@1",
        { op: "routineResult", input },
        requestId,
    )
    if (!answer.ok) return answer
    return answer.data.op === "routine" || answer.data.op === "routineResult"
        ? { ok: true, data: answer.data }
        : refusal(
              "accounting.routineResult@1",
              "UNEXPECTED_RESULT_TAG",
              "The receiver answered a non-routine variant.",
              requestId,
          )
}

/** Read one canonical summary period with its explicit partial coverage and continuation. */
export const readAccountingSummary = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    input: AccountingSummaryQueryInput,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingSummaryResult>> => {
    const answer = await sendAccountingOperation(
        accessToken,
        scope,
        "accounting.summary@1",
        { op: "summary", input },
        requestId,
    )
    if (!answer.ok) return answer
    return answer.data.op === "summary"
        ? { ok: true, data: answer.data }
        : refusal(
              "accounting.summary@1",
              "UNEXPECTED_RESULT_TAG",
              "The receiver answered a non-summary variant.",
              requestId,
          )
}

/** Read one current or historical result detail with its lineage. */
export const readAccountingResultDetail = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    input: AccountingResultDetailInput,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingResultDetailResult>> => {
    const answer = await sendAccountingOperation(
        accessToken,
        scope,
        "accounting.resultDetail@1",
        { op: "resultDetail", input },
        requestId,
    )
    if (!answer.ok) return answer
    return answer.data.op === "resultDetail"
        ? { ok: true, data: answer.data }
        : refusal(
              "accounting.resultDetail@1",
              "UNEXPECTED_RESULT_TAG",
              "The receiver answered a non-result-detail variant.",
              requestId,
          )
}

/** Admit one evidence item; an identical replay returns the same identity and a conflicting fingerprint is refused. */
export const commandAccountingAdmitEvidence = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    input: AccountingAdmitEvidenceInput,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingEvidenceResult>> => {
    const answer = await sendAccountingOperation(
        accessToken,
        scope,
        "accounting.admitEvidence@1",
        { op: "admitEvidence", input },
        requestId,
    )
    if (!answer.ok) return answer
    return answer.data.op === "admitEvidence" || answer.data.op === "evidence"
        ? { ok: true, data: answer.data }
        : refusal(
              "accounting.admitEvidence@1",
              "UNEXPECTED_RESULT_TAG",
              "The receiver answered a non-evidence variant.",
              requestId,
          )
}

/** Commit one routine decision, or retry an attempt with the proof that it never started. */
export const commandAccountingRoutine = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    input: AccountingRoutineInput,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingRoutineResult>> => {
    const answer = await sendAccountingOperation(
        accessToken,
        scope,
        "accounting.routine@1",
        { op: "routine", input },
        requestId,
    )
    if (!answer.ok) return answer
    return answer.data.op === "routine" || answer.data.op === "routineResult"
        ? { ok: true, data: answer.data }
        : refusal(
              "accounting.routine@1",
              "UNEXPECTED_RESULT_TAG",
              "The receiver answered a non-routine variant.",
              requestId,
          )
}

/** Answer, defer, reopen, escalate or dismiss one material exception at its exact revision. */
export const commandAccountingException = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    input: AccountingExceptionInput,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingExceptionResult>> => {
    const answer = await sendAccountingOperation(
        accessToken,
        scope,
        "accounting.exception@1",
        { op: "exception", input },
        requestId,
    )
    if (!answer.ok) return answer
    return answer.data.op === "exception"
        ? { ok: true, data: answer.data }
        : refusal(
              "accounting.exception@1",
              "UNEXPECTED_RESULT_TAG",
              "The receiver answered a non-exception variant.",
              requestId,
          )
}

/** Propose, append or proof-retry one forward correction and its single immutable lineage. */
export const commandAccountingCorrect = async (
    accessToken: string | null,
    scope: AccountingInstallationScope,
    input: AccountingCorrectInput,
    requestId: string,
): Promise<AccountingOperationAnswer<AccountingCorrectResult>> => {
    const answer = await sendAccountingOperation(
        accessToken,
        scope,
        "accounting.correct@1",
        { op: "correct", input },
        requestId,
    )
    if (!answer.ok) return answer
    return answer.data.op === "correct"
        ? { ok: true, data: answer.data }
        : refusal(
              "accounting.correct@1",
              "UNEXPECTED_RESULT_TAG",
              "The receiver answered a non-correction variant.",
              requestId,
          )
}
