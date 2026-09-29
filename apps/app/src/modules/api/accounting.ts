/*
 * THE INSTALLATION-SCOPED ACCOUNTING OPERATION CLIENT (CONTRACT-ACC-API through
 * CONTRACT-SH-HUMAN-ROUTE).
 *
 * THE SEAM IS CLOSED. The accepted public Accounting surface is the eight `accounting.*@1`
 * operations below, addressed through the browser-to-Core installation operation route. The legacy
 * GraphQL document workbench was NOT that surface; fe-modules-impl 3/9 removed it from this file,
 * from the SWR hook modules and from the hooks barrel by Kernel ruling, so nothing here resolves an
 * Accounting fact through GraphQL any more. The eight per-hook files under `hooks/swr/{queries,
 * mutations}` are the only callers, and each of their reads and commands lands on one operation
 * address below.
 *
 * FOUR PROPERTIES ARE THE POINT OF THIS HALF.
 *
 * 1. ONE OPERATION, ONE ADDRESS. Each of the eight names is exactly one POST to
 *    `/api/v1/agentos/workspaces/{workspaceId}/instances/{instanceId}/installations/{installationId}/operations/<name>@1`.
 *    The three installation coordinates are the address and nothing else - no header and no body
 *    field - so a command cannot be delivered to a sibling installation, and the receiver derives the
 *    principal from the verified token alone. The operation segment is one of eight literal
 *    registered names, so it is written verbatim: the receiver's own binding matches the `@1`
 *    version separator, which an escaped `%40` would no longer be.
 * 2. BEARER ONLY, NEVER THE COOKIE. `credentials: "omit"` keeps the refresh cookie at the Core
 *    session boundary, and the access token travels in the Authorization header only - never in a
 *    URL, browser storage or a log.
 * 3. THE STABLE INTENT IDENTITY IS THE REQUEST ID. The caller mints it once and replays the SAME
 *    identity on a retry; that is what makes a replayed command one intent rather than two.
 * 4. UNKNOWN IS NEVER SUCCESS. A route `outcome_unknown`, a receiver `outcome-unknown` failure and a
 *    DEADLINE_EXCEEDED all leave the effect unattested and name the read of the same identity that
 *    reconciles it. Nothing here promotes any of them to a completed effect, and nothing here retries
 *    on its own: one call is one request.
 */

import { failedWith, type Outcome } from "./outcome"
import {
    isClosedRecord,
    isRouteErrorName,
    operationAddress,
    routeFailureKind,
    sendOperation,
    type InstallationScope,
} from "./operation-route"

/** The three installation coordinates every Accounting operation address carries. */
export type AccountingInstallationScope = InstallationScope

/** The operation discriminator the receiver repeats on every answer, success or failure. */
export type AccountingApiOperation =
    "admitEvidence" | "evidence" | "routine" | "routineResult" | "exception" | "correct" | "summary" | "resultDetail"

/** The eight registered Accounting operation names this client may address. */
export type AccountingRouteName =
    | "accounting.admitEvidence@1"
    | "accounting.evidence@1"
    | "accounting.routine@1"
    | "accounting.routineResult@1"
    | "accounting.exception@1"
    | "accounting.correct@1"
    | "accounting.summary@1"
    | "accounting.resultDetail@1"

/** The four registered Accounting reads, and the only addresses an uncertain command is reconciled through. */
export type AccountingReadName =
    "accounting.evidence@1" | "accounting.routineResult@1" | "accounting.summary@1" | "accounting.resultDetail@1"

/** Closed transport failures the receiver names; they carry no protected detail. */
export type AccountingApiFailureKind = "forbidden" | "stale-authority" | "validation" | "conflict" | "outcome-unknown"

/** Closed lifecycle states for admitted evidence. */
export type AccountingEvidenceState =
    "admitted" | "reading" | "ready" | "needs_information" | "likely_duplicate" | "unreadable" | "rejected"

/** Closed routine reservation, decision and result states. */
export type AccountingRoutineState =
    "admitted" | "committed" | "needs-decision" | "pending-authority" | "denied" | "outcome-unknown"

/** Closed material-exception states after one attributable action. */
export type AccountingExceptionState = "open" | "deferred" | "escalated" | "answered" | "resolved" | "dismissed"

/** Closed forward-correction and retry states. */
export type AccountingCorrectionState =
    "proposed" | "blocked" | "possible_start" | "applied" | "proven_not_applied" | "outcome_unknown"

/** Payment matching status that never infers payment from an order. */
export type AccountingMatchStatus = "unpaid" | "unmatched" | "matched" | "ambiguous"

/** Business-first measures a summary item may carry. */
export type AccountingMeasureKind =
    "cash-in" | "cash-out" | "recognized-revenue" | "recognized-cost" | "unpaid" | "estimated-tax"

/** Safe reasons a summary cannot claim complete coverage. */
export type AccountingPartialReason =
    "missing-occurred-on" | "missing-measure-coverage" | "stale-source" | "unavailable-source"

/** Availability label applied without fabricating a measured value. */
export type AccountingAvailability = "current" | "partial" | "stale" | "unavailable"

/** The closed set of fact names a corrected-fact field may address. */
export type AccountingCorrectedFactField =
    "amountMinor" | "currency" | "occurredOn" | "counterpartyRef" | "matchStatus" | "treatment"

/** One closed tagged scalar carried by a supplied or corrected fact. */
export type AccountingFactValue =
    | { readonly kind: "text"; readonly value: string }
    | { readonly kind: "integer"; readonly value: number }
    | { readonly kind: "boolean"; readonly value: boolean }
    | { readonly kind: "local-date"; readonly value: string }
    | { readonly kind: "timestamptz"; readonly value: string }
    | { readonly kind: "money"; readonly amountMinor: number; readonly currency: string }

/** A caller-supplied fact: a name, one tagged value and attributable evidence references. */
export interface AccountingSuppliedFact {
    readonly name: string
    readonly value: AccountingFactValue
    readonly evidenceRefs: ReadonlyArray<string>
}

/** A forward-correction fact: a closed field, its old and new tagged values and evidence references. */
export interface AccountingCorrectedFact {
    readonly field: AccountingCorrectedFactField
    readonly oldValue: AccountingFactValue | null
    readonly newValue: AccountingFactValue | null
    readonly evidenceRefs: ReadonlyArray<string>
}

/** A closed measure: a known measure carries amount and currency, an unknown one carries a reason. */
export type AccountingMeasurePayload =
    | {
          readonly kind: AccountingMeasureKind
          readonly status: "known"
          readonly amountMinor: number
          readonly currency: string
      }
    | { readonly kind: AccountingMeasureKind; readonly status: "unknown"; readonly reasonCode: string }

/** A closed treatment outcome derived from configured policy. */
export type AccountingTreatmentPayload =
    | { readonly kind: "supported"; readonly code: string }
    | { readonly kind: "unsupported"; readonly reasonCode: string }
    | { readonly kind: "unknown"; readonly reasonCode: string }

/** Immutable business-first projection of one current result snapshot. */
export interface AccountingSummaryItemPayload {
    readonly itemId: string
    readonly resultId: string
    readonly version: number
    readonly effectiveAt: string
    readonly occurredOn: string | null
    readonly currency: string | null
    readonly measures: ReadonlyArray<AccountingMeasurePayload>
    readonly paymentStatus: AccountingMatchStatus
    readonly attentionCodes: ReadonlyArray<string>
    readonly availability: AccountingAvailability
    readonly sourceEvidenceRefs: ReadonlyArray<string>
    readonly policyRevision: string
    readonly receiptId: string | null
}

/** Canonical half-open period result with explicit partial coverage and continuation. */
export interface AccountingSummaryPayload {
    readonly periodStart: string
    readonly periodEndExclusive: string
    readonly currency: string | null
    readonly items: ReadonlyArray<AccountingSummaryItemPayload>
    readonly partialReasons: ReadonlyArray<AccountingPartialReason>
    readonly nextCursor: string | null
}

/** Closed facts disclosed for one authorized result detail. */
export interface AccountingResultFacts {
    readonly amountMinor: number | null
    readonly currency: string | null
    readonly occurredOn: string | null
    readonly counterpartyRef: string | null
    readonly matchStatus: AccountingMatchStatus
    readonly treatment: AccountingTreatmentPayload
}

/** Immutable current or historical result detail with lineage. */
export interface AccountingResultDetailPayload {
    readonly resultId: string
    readonly itemId: string
    readonly version: number
    readonly effectiveAt: string
    readonly state: "current" | "historical"
    readonly facts: AccountingResultFacts
    readonly sourceEvidenceRefs: ReadonlyArray<string>
    readonly policyRevision: string
    readonly receiptId: string | null
    readonly predecessorResultId: string | null
    readonly successorResultId: string | null
}

/** Closed caller reference for evidence admission. */
export interface AccountingAdmitEvidenceInput {
    readonly evidenceId: string
    readonly sourceKind: string
    readonly sourceRef: string
    readonly sourceRevision: string
    readonly fingerprint: string
    readonly expectedRevision: number
}

/** Read-only evidence identity lookup. */
export interface AccountingEvidenceInput {
    readonly evidenceId: string
}

/** Routine commit request bound to evidence, policy and item revision. */
export interface AccountingRoutineCommitInput {
    readonly action: "commit"
    readonly itemId: string
    readonly evidenceIds: ReadonlyArray<string>
    readonly intentId: string
    readonly policyRevision: string
    readonly expectedItemRevision: number
    readonly materialExceptionId?: string
}

/** Proof-referenced retry request whose fence is resolved from receiver state. */
export interface AccountingRoutineRetryInput {
    readonly action: "retry"
    readonly intentId: string
    readonly oldAttemptId: string
    readonly notStartedProofRef: string
    readonly newAttemptId: string
}

/** Closed routine commit or proof-consuming retry input. */
export type AccountingRoutineInput = AccountingRoutineCommitInput | AccountingRoutineRetryInput

/** Read-only lookup for a stable routine intent. */
export interface AccountingRoutineResultInput {
    readonly intentId: string
}

/** Closed attributable answer facts for one material exception. */
export interface AccountingExceptionAnswer {
    readonly choiceCode: string | null
    readonly suppliedFacts: ReadonlyArray<AccountingSuppliedFact>
    readonly reason: string | null
}

/** Revision-fenced answer command for a material exception. */
export interface AccountingExceptionAnswerInput {
    readonly action: "answer"
    readonly exceptionId: string
    readonly answer: AccountingExceptionAnswer
    readonly answerEvidenceRefs: ReadonlyArray<string>
    readonly expectedRevision: number
}

/** Revision-fenced defer, reopen, escalate or dismiss command. */
export interface AccountingExceptionDispositionInput {
    readonly action: "defer" | "reopen" | "escalate" | "dismiss"
    readonly exceptionId: string
    readonly reason: string
    readonly expectedRevision: number
}

/** Closed answer or non-answer material-exception action. */
export type AccountingExceptionInput = AccountingExceptionAnswerInput | AccountingExceptionDispositionInput

/** Proposed forward correction with closed field and value changes. */
export interface AccountingCorrectProposeInput {
    readonly action: "propose"
    readonly correctionId: string
    readonly predecessorResultId: string
    readonly correctedFacts: ReadonlyArray<AccountingCorrectedFact>
    readonly reason: string
    readonly evidenceRefs: ReadonlyArray<string>
    readonly expectedResultRevision: number
}

/** Request to append a previously proposed correction. */
export interface AccountingCorrectAppendInput {
    readonly action: "append"
    readonly correctionId: string
    readonly attemptId: string
    readonly expectedRevision: number
}

/** Proof-referenced retry of one uncertain correction attempt. */
export interface AccountingCorrectRetryInput {
    readonly action: "retry"
    readonly correctionId: string
    readonly oldAttemptId: string
    readonly notAppliedProofRef: string
    readonly newAttemptId: string
    readonly expectedRevision: number
}

/** Closed propose, append or proof-consuming correction action. */
export type AccountingCorrectInput =
    AccountingCorrectProposeInput | AccountingCorrectAppendInput | AccountingCorrectRetryInput

/** Canonical summary period, exact currency filter, page size and opaque cursor. */
export interface AccountingSummaryQueryInput {
    readonly periodStart: string
    readonly periodEndExclusive: string
    readonly currency: string | null
    readonly pageSize: number
    readonly cursor: string | null
}

/** Current immutable result lookup by result identity. */
export interface AccountingResultDetailCurrentInput {
    readonly action: "current"
    readonly resultId: string
}

/** Historical result lookup by item and zoned timestamp. */
export interface AccountingResultDetailAsOfInput {
    readonly action: "asOf"
    readonly itemId: string
    readonly asOf: string
}

/** Closed current or as-of result-detail selector. */
export type AccountingResultDetailInput = AccountingResultDetailCurrentInput | AccountingResultDetailAsOfInput

/** Exactly one closed Accounting operation selected by its tag. */
export type AccountingRequest =
    | { readonly op: "admitEvidence"; readonly input: AccountingAdmitEvidenceInput }
    | { readonly op: "evidence"; readonly input: AccountingEvidenceInput }
    | { readonly op: "routine"; readonly input: AccountingRoutineInput }
    | { readonly op: "routineResult"; readonly input: AccountingRoutineResultInput }
    | { readonly op: "exception"; readonly input: AccountingExceptionInput }
    | { readonly op: "correct"; readonly input: AccountingCorrectInput }
    | { readonly op: "summary"; readonly input: AccountingSummaryQueryInput }
    | { readonly op: "resultDetail"; readonly input: AccountingResultDetailInput }

/** Evidence state returned without open domain facts. */
export interface AccountingEvidenceResultPayload {
    readonly evidenceId: string
    readonly state: AccountingEvidenceState
    readonly revision: number
    readonly missingFacts: ReadonlyArray<string>
}

/** Routine state and immutable receipt and result identities. */
export interface AccountingRoutineResultPayload {
    readonly intentId: string
    readonly itemId: string | null
    readonly attemptId: string | null
    readonly state: AccountingRoutineState
    readonly receiptId: string | null
    readonly resultId: string | null
    readonly reasonCode: string | null
}

/** Material-exception state after one revision-fenced action. */
export interface AccountingExceptionResultPayload {
    readonly exceptionId: string
    readonly state: AccountingExceptionState
    readonly revision: number
}

/** Forward-correction state and immutable lineage identities. */
export interface AccountingCorrectResultPayload {
    readonly correctionId: string
    readonly attemptId: string
    readonly state: AccountingCorrectionState
    readonly resultId: string | null
    readonly predecessorResultId: string | null
}

/** Tagged evidence admission or read result. */
export interface AccountingEvidenceResult {
    readonly op: "admitEvidence" | "evidence"
    readonly payload: AccountingEvidenceResultPayload
}

/** Tagged routine command or query result. */
export interface AccountingRoutineResult {
    readonly op: "routine" | "routineResult"
    readonly payload: AccountingRoutineResultPayload
}

/** Tagged material-exception result. */
export interface AccountingExceptionResult {
    readonly op: "exception"
    readonly payload: AccountingExceptionResultPayload
}

/** Tagged correction result. */
export interface AccountingCorrectResult {
    readonly op: "correct"
    readonly payload: AccountingCorrectResultPayload
}

/** Tagged canonical summary result. */
export interface AccountingSummaryResult {
    readonly op: "summary"
    readonly payload: AccountingSummaryPayload
}

/** Tagged current or historical result-detail result. */
export interface AccountingResultDetailResult {
    readonly op: "resultDetail"
    readonly payload: AccountingResultDetailPayload
}

/** Exactly one closed result carrying the same operation meaning as its request. */
export type AccountingResult =
    | AccountingEvidenceResult
    | AccountingRoutineResult
    | AccountingExceptionResult
    | AccountingCorrectResult
    | AccountingSummaryResult
    | AccountingResultDetailResult

/**
 * What one failed Accounting answer adds to the common failure fields.
 *
 * The `code` is one of the route's closed error names, `outcome_unknown` (a command whose effect
 * nobody can attest: never success, never failure, reconciled only by a read), one of the receiver's
 * named failures (`forbidden`, `stale-authority`, `validation`, `conflict`), or a transport condition
 * (`UNAUTHENTICATED`, `UNREACHABLE`, `MALFORMED_ANSWER`, `UNEXPECTED_RESULT_KIND`,
 * `UNEXPECTED_RESULT_TAG`, `ECHOED_IDENTITY_MISMATCH`).
 */
export type AccountingFailureDetail = {
    readonly operation: AccountingRouteName
    readonly requestId: string | null
    readonly reconciles: AccountingReadName | null
}

/** One Accounting answer: the receiver's own tagged variant, or a failure that names why it is unresolved. */
export type AccountingOperationAnswer<TResult extends AccountingResult> = Outcome<TResult, AccountingFailureDetail>

/** The read one uncertain command is reconciled through; a command absent here registers no read. */
export const ACCOUNTING_COMMAND_RECONCILIATIONS: Readonly<Partial<Record<AccountingRouteName, AccountingReadName>>> = {
    "accounting.admitEvidence@1": "accounting.evidence@1",
    "accounting.routine@1": "accounting.routineResult@1",
    "accounting.correct@1": "accounting.resultDetail@1",
}

/** The receiver's own result tags each route name may answer with; a command and its read share a pair. */
const ACCOUNTING_RESULT_TAGS: Readonly<Record<AccountingRouteName, Array<AccountingApiOperation>>> = {
    "accounting.admitEvidence@1": ["admitEvidence", "evidence"],
    "accounting.evidence@1": ["admitEvidence", "evidence"],
    "accounting.routine@1": ["routine", "routineResult"],
    "accounting.routineResult@1": ["routine", "routineResult"],
    "accounting.exception@1": ["exception"],
    "accounting.correct@1": ["correct"],
    "accounting.summary@1": ["summary"],
    "accounting.resultDetail@1": ["resultDetail"],
}

const refusal = (
    operation: AccountingRouteName,
    code: string,
    reason: string,
    requestId: string | null,
): AccountingOperationAnswer<never> =>
    failedWith(
        routeFailureKind(code),
        { code, reason },
        { operation, requestId, reconciles: ACCOUNTING_COMMAND_RECONCILIATIONS[operation] ?? null },
    )

const unknownOutcome = (operation: AccountingRouteName, requestId: string): AccountingOperationAnswer<never> =>
    refusal(operation, "outcome_unknown", "", requestId)

/*
 * Hand the receiver's own tagged variant through unchanged.
 *
 * The variant identity, its operation tag and its payload object are verified by the caller before
 * this runs; what cannot be recovered statically is the union member, because a wire object carries
 * no type. The value therefore enters as `unknown`, which is the one starting point a single cast can
 * legitimately narrow - a cast through `unknown` would erase a shape the compiler had, and there is
 * no shape here for it to erase.
 */
const accountingServedResult = (tagged: unknown): AccountingResult => tagged as AccountingResult

/** Whether a result tag is one of the eight registered Accounting tags. */
const isAccountingApiOperation = (value: unknown): value is AccountingApiOperation =>
    value === "admitEvidence" ||
    value === "evidence" ||
    value === "routine" ||
    value === "routineResult" ||
    value === "exception" ||
    value === "correct" ||
    value === "summary" ||
    value === "resultDetail"

/** Whether a failure name is one the receiver's closed set declares. */
const isAccountingApiFailureKind = (value: unknown): value is AccountingApiFailureKind =>
    value === "forbidden" ||
    value === "stale-authority" ||
    value === "validation" ||
    value === "conflict" ||
    value === "outcome-unknown"

/**
 * Narrow the receiver's own outcome.
 *
 * The envelope is checked here - success or failure, the echoed operation tag - while the receiver's
 * field-level closure stays the receiver's own guarantee: its schema refuses an unknown field before
 * it answers, so a browser revalidating every field would be a second opinion about a shape it did
 * not author.
 */
const narrowAccountingOutcome = (
    operation: AccountingRouteName,
    requestId: string,
    result: unknown,
): AccountingOperationAnswer<AccountingResult> => {
    if (!isClosedRecord(result))
        return refusal(operation, "MALFORMED_ANSWER", "The answer carries no outcome object.", requestId)
    if (result.ok === false) {
        const failure = result.failure
        if (!isClosedRecord(failure))
            return refusal(operation, "MALFORMED_ANSWER", "The refused outcome carries no failure.", requestId)
        if (!isAccountingApiFailureKind(failure.error))
            return refusal(
                operation,
                "UNEXPECTED_RESULT_TAG",
                `The receiver named the undeclared failure ${String(failure.error)}.`,
                requestId,
            )
        if (failure.error === "outcome-unknown") return unknownOutcome(operation, requestId)
        return refusal(
            operation,
            failure.error,
            typeof failure.reasonCode === "string" ? failure.reasonCode : "",
            requestId,
        )
    }
    if (result.ok !== true)
        return refusal(operation, "MALFORMED_ANSWER", "The outcome states neither success nor failure.", requestId)
    const rawResult: unknown = result.result
    if (!isClosedRecord(rawResult))
        return refusal(operation, "MALFORMED_ANSWER", "The succeeded outcome carries no result object.", requestId)
    const expected = ACCOUNTING_RESULT_TAGS[operation]
    if (!isAccountingApiOperation(rawResult.op) || !expected.includes(rawResult.op)) {
        return refusal(
            operation,
            "UNEXPECTED_RESULT_TAG",
            `The receiver answered the ${String(rawResult.op)} variant for ${operation}.`,
            requestId,
        )
    }
    if (!isClosedRecord(rawResult.payload))
        return refusal(operation, "MALFORMED_ANSWER", "The tagged result carries no payload object.", requestId)
    return { ok: true, data: accountingServedResult(rawResult) }
}

/** Narrow the route's own closed reply, keeping every non-served outcome a refusal. */
const narrowOperationAnswer = (
    operation: AccountingRouteName,
    requestId: string,
    body: unknown,
): AccountingOperationAnswer<AccountingResult> => {
    if (!isClosedRecord(body))
        return refusal(operation, "MALFORMED_ANSWER", "The route answer is not an envelope object.", requestId)
    if (body.kind === "outcome_unknown") {
        if (body.operation !== operation || body.requestId !== requestId) {
            return refusal(
                operation,
                "ECHOED_IDENTITY_MISMATCH",
                "The unknown outcome echoes an identity this call did not send.",
                requestId,
            )
        }
        return unknownOutcome(operation, requestId)
    }
    if (body.kind === "sales_result") {
        return refusal(
            operation,
            "UNEXPECTED_RESULT_KIND",
            "The route answered the Sales result kind for an Accounting operation.",
            requestId,
        )
    }
    if (body.kind === "accounting_result") {
        if (body.operation !== operation)
            return refusal(
                operation,
                "ECHOED_IDENTITY_MISMATCH",
                "The result echoes another operation name.",
                requestId,
            )
        if (body.requestId !== requestId)
            return refusal(
                operation,
                "ECHOED_IDENTITY_MISMATCH",
                "The result echoes another stable identity.",
                requestId,
            )
        return narrowAccountingOutcome(operation, requestId, body.result)
    }
    if (isRouteErrorName(body.kind)) {
        return refusal(operation, body.kind, typeof body.reason === "string" ? body.reason : "", requestId)
    }
    return refusal(
        operation,
        "UNEXPECTED_RESULT_KIND",
        `The route answered the undeclared result kind ${String(body.kind)}.`,
        requestId,
    )
}

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
