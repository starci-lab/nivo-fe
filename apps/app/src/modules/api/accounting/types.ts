import type { Outcome } from "../outcome"
import type { InstallationScope } from "../operation-route"

/** The read one uncertain command is reconciled through; a command absent here registers no read. */
export const ACCOUNTING_COMMAND_RECONCILIATIONS: Readonly<Partial<Record<AccountingRouteName, AccountingReadName>>> = {
    "accounting.admitEvidence@1": "accounting.evidence@1",
    "accounting.routine@1": "accounting.routineResult@1",
    "accounting.correct@1": "accounting.resultDetail@1",
}

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
