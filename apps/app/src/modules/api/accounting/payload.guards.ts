/**
 * The parser of the receiver's tagged Accounting result.
 *
 * `parseAccountingResult` narrows the wire's `{ op, payload }` pair by its operation tag - the same
 * tag `narrowAccountingOutcome` already registered against the route name - and validates the
 * payload the tag names. It returns the tagged variant or null; the caller turns null into the
 * existing `MALFORMED_ANSWER` refusal, so a malformed payload is never a thrown error and never a
 * result under a borrowed name.
 */

import { isNullableString, isNumber, isOneOf, isRecord, isString, isStringArray } from "../wire"
import type {
    AccountingAvailability,
    AccountingCorrectResultPayload,
    AccountingCorrectionState,
    AccountingEvidenceResultPayload,
    AccountingEvidenceState,
    AccountingExceptionResultPayload,
    AccountingExceptionState,
    AccountingMatchStatus,
    AccountingMeasureKind,
    AccountingMeasurePayload,
    AccountingPartialReason,
    AccountingResult,
    AccountingResultDetailPayload,
    AccountingRoutineResultPayload,
    AccountingRoutineState,
    AccountingSummaryItemPayload,
    AccountingSummaryPayload,
    AccountingTreatmentPayload,
} from "./types"

const isAccountingMeasureKind = (value: unknown): value is AccountingMeasureKind =>
    isOneOf(value, ["cash-in", "cash-out", "recognized-revenue", "recognized-cost", "unpaid", "estimated-tax"])

const isAccountingMatchStatus = (value: unknown): value is AccountingMatchStatus =>
    isOneOf(value, ["unpaid", "unmatched", "matched", "ambiguous"])

const isAccountingAvailability = (value: unknown): value is AccountingAvailability =>
    isOneOf(value, ["current", "partial", "stale", "unavailable"])

const isAccountingPartialReason = (value: unknown): value is AccountingPartialReason =>
    isOneOf(value, ["missing-occurred-on", "missing-measure-coverage", "stale-source", "unavailable-source"])

const isAccountingMeasurePayload = (value: unknown): value is AccountingMeasurePayload => {
    if (!isRecord(value) || !isAccountingMeasureKind(value.kind)) return false
    if (value.status === "known") return isNumber(value.amountMinor) && isString(value.currency)
    return value.status === "unknown" && isString(value.reasonCode)
}

const isAccountingTreatmentPayload = (value: unknown): value is AccountingTreatmentPayload => {
    if (!isRecord(value)) return false
    if (value.kind === "supported") return isString(value.code)
    return (value.kind === "unsupported" || value.kind === "unknown") && isString(value.reasonCode)
}

const isAccountingSummaryItemPayload = (value: unknown): value is AccountingSummaryItemPayload => {
    if (!isRecord(value)) return false
    return (
        isString(value.itemId) &&
        isString(value.resultId) &&
        isNumber(value.version) &&
        isString(value.effectiveAt) &&
        isNullableString(value.occurredOn) &&
        isNullableString(value.currency) &&
        Array.isArray(value.measures) &&
        value.measures.every(isAccountingMeasurePayload) &&
        isAccountingMatchStatus(value.paymentStatus) &&
        isStringArray(value.attentionCodes) &&
        isAccountingAvailability(value.availability) &&
        isStringArray(value.sourceEvidenceRefs) &&
        isString(value.policyRevision) &&
        isNullableString(value.receiptId)
    )
}

const isAccountingSummaryPayload = (value: unknown): value is AccountingSummaryPayload => {
    if (!isRecord(value) || !Array.isArray(value.items) || !Array.isArray(value.partialReasons)) return false
    return (
        isString(value.periodStart) &&
        isString(value.periodEndExclusive) &&
        isNullableString(value.currency) &&
        value.items.every(isAccountingSummaryItemPayload) &&
        value.partialReasons.every(isAccountingPartialReason) &&
        isNullableString(value.nextCursor)
    )
}

const isAccountingEvidenceState = (value: unknown): value is AccountingEvidenceState =>
    isOneOf(value, ["admitted", "reading", "ready", "needs_information", "likely_duplicate", "unreadable", "rejected"])

const isAccountingEvidenceResultPayload = (value: unknown): value is AccountingEvidenceResultPayload =>
    isRecord(value) &&
    isString(value.evidenceId) &&
    isAccountingEvidenceState(value.state) &&
    isNumber(value.revision) &&
    isStringArray(value.missingFacts)

const isAccountingRoutineState = (value: unknown): value is AccountingRoutineState =>
    isOneOf(value, ["admitted", "committed", "needs-decision", "pending-authority", "denied", "outcome-unknown"])

const isAccountingRoutineResultPayload = (value: unknown): value is AccountingRoutineResultPayload =>
    isRecord(value) &&
    isString(value.intentId) &&
    isNullableString(value.itemId) &&
    isNullableString(value.attemptId) &&
    isAccountingRoutineState(value.state) &&
    isNullableString(value.receiptId) &&
    isNullableString(value.resultId) &&
    isNullableString(value.reasonCode)

const isAccountingExceptionState = (value: unknown): value is AccountingExceptionState =>
    isOneOf(value, ["open", "deferred", "escalated", "answered", "resolved", "dismissed"])

const isAccountingExceptionResultPayload = (value: unknown): value is AccountingExceptionResultPayload =>
    isRecord(value) && isString(value.exceptionId) && isAccountingExceptionState(value.state) && isNumber(value.revision)

const isAccountingCorrectionState = (value: unknown): value is AccountingCorrectionState =>
    isOneOf(value, ["proposed", "blocked", "possible_start", "applied", "proven_not_applied", "outcome_unknown"])

const isAccountingCorrectResultPayload = (value: unknown): value is AccountingCorrectResultPayload =>
    isRecord(value) &&
    isString(value.correctionId) &&
    isString(value.attemptId) &&
    isAccountingCorrectionState(value.state) &&
    isNullableString(value.resultId) &&
    isNullableString(value.predecessorResultId)

const isAccountingResultDetailPayload = (value: unknown): value is AccountingResultDetailPayload => {
    if (!isRecord(value) || !isRecord(value.facts)) return false
    return (
        isString(value.resultId) &&
        isString(value.itemId) &&
        isNumber(value.version) &&
        isString(value.effectiveAt) &&
        (value.state === "current" || value.state === "historical") &&
        (value.facts.amountMinor === null || isNumber(value.facts.amountMinor)) &&
        isNullableString(value.facts.currency) &&
        isNullableString(value.facts.occurredOn) &&
        isNullableString(value.facts.counterpartyRef) &&
        isAccountingMatchStatus(value.facts.matchStatus) &&
        isAccountingTreatmentPayload(value.facts.treatment) &&
        isStringArray(value.sourceEvidenceRefs) &&
        isString(value.policyRevision) &&
        isNullableString(value.receiptId) &&
        isNullableString(value.predecessorResultId) &&
        isNullableString(value.successorResultId)
    )
}

/** Parse the receiver's tagged result by its `op` discriminant; null when the payload is malformed. */
export const parseAccountingResult = (tagged: unknown): AccountingResult | null => {
    if (!isRecord(tagged)) return null
    const payload = tagged.payload
    switch (tagged.op) {
        case "admitEvidence":
        case "evidence":
            return isAccountingEvidenceResultPayload(payload) ? { op: tagged.op, payload } : null
        case "routine":
        case "routineResult":
            return isAccountingRoutineResultPayload(payload) ? { op: tagged.op, payload } : null
        case "exception":
            return isAccountingExceptionResultPayload(payload) ? { op: tagged.op, payload } : null
        case "correct":
            return isAccountingCorrectResultPayload(payload) ? { op: tagged.op, payload } : null
        case "summary":
            return isAccountingSummaryPayload(payload) ? { op: "summary", payload } : null
        case "resultDetail":
            return isAccountingResultDetailPayload(payload) ? { op: "resultDetail", payload } : null
        default:
            return null
    }
}
