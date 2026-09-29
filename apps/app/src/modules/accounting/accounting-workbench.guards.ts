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
    AccountingResultDetailPayload,
    AccountingRoutineResultPayload,
    AccountingRoutineState,
    AccountingSummaryItemPayload,
    AccountingSummaryPayload,
    AccountingTreatmentPayload,
} from "@/modules/api/accounting"
import type { AccountingClassification, AccountingIntakeSnapshot } from "./accounting-workbench"

/** Narrow an unknown object before reading its named Accounting fields. */
export const isAccountingRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

/** Narrow the Setup object that may carry Accounting intake facts. */
export const isAccountingIntakeSnapshot = (value: unknown): value is AccountingIntakeSnapshot =>
    isAccountingRecord(value)

/** Whether one Setup intake classification is part of Accounting's closed vocabulary. */
export const isAccountingClassification = (value: unknown): value is AccountingClassification =>
    value === "income" || value === "expense" || value === "receivable" || value === "payable"

/** Parse the classifications list without trusting the transport's array element type. */
export const isAccountingClassifications = (value: unknown): value is ReadonlyArray<AccountingClassification> =>
    Array.isArray(value) && value.every(isAccountingClassification)

const isUnknownArray = (value: unknown): value is ReadonlyArray<unknown> => Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === "string"
const isNullableString = (value: unknown): value is string | null => value === null || isString(value)
const isStringArray = (value: unknown): value is ReadonlyArray<string> =>
    isUnknownArray(value) && value.every(isString)
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)
const isOneOf = <Value extends string>(value: unknown, choices: ReadonlyArray<Value>): value is Value =>
    isString(value) && choices.some((choice) => choice === value)

const isAccountingMeasureKind = (value: unknown): value is AccountingMeasureKind =>
    isOneOf(value, ["cash-in", "cash-out", "recognized-revenue", "recognized-cost", "unpaid", "estimated-tax"])

const isAccountingMatchStatus = (value: unknown): value is AccountingMatchStatus =>
    isOneOf(value, ["unpaid", "unmatched", "matched", "ambiguous"])

const isAccountingAvailability = (value: unknown): value is AccountingAvailability =>
    isOneOf(value, ["current", "partial", "stale", "unavailable"])

const isAccountingPartialReason = (value: unknown): value is AccountingPartialReason =>
    isOneOf(value, ["missing-occurred-on", "missing-measure-coverage", "stale-source", "unavailable-source"])

const isAccountingMeasurePayload = (value: unknown): value is AccountingMeasurePayload => {
    if (!isAccountingRecord(value) || !isAccountingMeasureKind(value.kind)) return false
    if (value.status === "known") return isNumber(value.amountMinor) && isString(value.currency)
    return value.status === "unknown" && isString(value.reasonCode)
}

const isAccountingTreatmentPayload = (value: unknown): value is AccountingTreatmentPayload => {
    if (!isAccountingRecord(value)) return false
    if (value.kind === "supported") return isString(value.code)
    return (value.kind === "unsupported" || value.kind === "unknown") && isString(value.reasonCode)
}

const isAccountingSummaryItemPayload = (value: unknown): value is AccountingSummaryItemPayload => {
    if (!isAccountingRecord(value)) return false
    return (
        isString(value.itemId) &&
        isString(value.resultId) &&
        isNumber(value.version) &&
        isString(value.effectiveAt) &&
        isNullableString(value.occurredOn) &&
        isNullableString(value.currency) &&
        isUnknownArray(value.measures) &&
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
    if (!isAccountingRecord(value) || !isUnknownArray(value.items) || !isUnknownArray(value.partialReasons)) return false
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

const isAccountingEvidenceResultPayload = (value: unknown): value is AccountingEvidenceResultPayload => {
    if (!isAccountingRecord(value)) return false
    return (
        isString(value.evidenceId) &&
        isAccountingEvidenceState(value.state) &&
        isNumber(value.revision) &&
        isStringArray(value.missingFacts)
    )
}

const isAccountingRoutineState = (value: unknown): value is AccountingRoutineState =>
    isOneOf(value, ["admitted", "committed", "needs-decision", "pending-authority", "denied", "outcome-unknown"])

const isAccountingRoutineResultPayload = (value: unknown): value is AccountingRoutineResultPayload => {
    if (!isAccountingRecord(value)) return false
    return (
        isString(value.intentId) &&
        isNullableString(value.itemId) &&
        isNullableString(value.attemptId) &&
        isAccountingRoutineState(value.state) &&
        isNullableString(value.receiptId) &&
        isNullableString(value.resultId) &&
        isNullableString(value.reasonCode)
    )
}

const isAccountingExceptionState = (value: unknown): value is AccountingExceptionState =>
    isOneOf(value, ["open", "deferred", "escalated", "answered", "resolved", "dismissed"])

const isAccountingExceptionResultPayload = (value: unknown): value is AccountingExceptionResultPayload => {
    if (!isAccountingRecord(value)) return false
    return isString(value.exceptionId) && isAccountingExceptionState(value.state) && isNumber(value.revision)
}

const isAccountingCorrectionState = (value: unknown): value is AccountingCorrectionState =>
    isOneOf(value, ["proposed", "blocked", "possible_start", "applied", "proven_not_applied", "outcome_unknown"])

const isAccountingCorrectResultPayload = (value: unknown): value is AccountingCorrectResultPayload => {
    if (!isAccountingRecord(value)) return false
    return (
        isString(value.correctionId) &&
        isString(value.attemptId) &&
        isAccountingCorrectionState(value.state) &&
        isNullableString(value.resultId) &&
        isNullableString(value.predecessorResultId)
    )
}

const isAccountingResultDetailPayload = (value: unknown): value is AccountingResultDetailPayload => {
    if (!isAccountingRecord(value) || !isAccountingRecord(value.facts) || !isAccountingRecord(value.facts.treatment))
        return false
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

/** Parse one untrusted summary reading; invalid shapes follow the caller's existing empty-reading fallback. */
export const parseAccountingSummaryReading = (value: unknown): AccountingSummaryPayload | null =>
    isAccountingSummaryPayload(value) ? value : null

/** Parse one untrusted evidence reading. */
export const parseAccountingEvidenceReading = (value: unknown): AccountingEvidenceResultPayload | null =>
    isAccountingEvidenceResultPayload(value) ? value : null

/** Parse one untrusted routine reading. */
export const parseAccountingRoutineReading = (value: unknown): AccountingRoutineResultPayload | null =>
    isAccountingRoutineResultPayload(value) ? value : null

/** Parse one untrusted material-exception command reading. */
export const parseAccountingExceptionReading = (value: unknown): AccountingExceptionResultPayload | null =>
    isAccountingExceptionResultPayload(value) ? value : null

/** Parse one untrusted forward-correction command reading. */
export const parseAccountingCorrectionReading = (value: unknown): AccountingCorrectResultPayload | null =>
    isAccountingCorrectResultPayload(value) ? value : null

/** Parse one untrusted result-detail reading. */
export const parseAccountingResultDetailReading = (value: unknown): AccountingResultDetailPayload | null =>
    isAccountingResultDetailPayload(value) ? value : null
