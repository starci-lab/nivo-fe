import { isOneOf, isRecord, type Outcome } from "@nivo/api"
import type { Formatter } from "@/modules/i18n/formatter"
/*
 * The pure Accounting workbench projection.
 *
 * The accepted `ui.accounting.workbench` vocabulary the eight `accounting.*@1` operations are
 * projected through: every label, every closed state and every period this surface can render is a
 * pure function of a wire value here.
 */

/** A closed Accounting intake classification, as the Setup snapshot words it. */
export type AccountingClassification = "income" | "expense" | "receivable" | "payable"
/** The two distinguishable Accounting viewer roles. */
type AccountingViewerRole = "owner" | "approver"
/** The ledger row facts the correction tips are chosen from. */
type AccountingLedgerEntry = { readonly id: string; readonly correctionOfId: string | null }
/** The correction proposal facts the advisory controls are chosen from. */
type AccountingCorrection = {
    readonly status: string
    readonly effectivePeriodKey: string
    readonly submittedByUserId: string
    readonly approverUserId: string
    readonly sourceEntryId: string
}
/** One canonical period's key and state. */
type AccountingPeriod = { readonly periodKey: string; readonly status: string }

type TranslationValues = Readonly<Record<string, string | number | undefined>>
/** Accounting classifications accepted by the setup projection and intake controller. */
export const ACCOUNTING_CLASSIFICATIONS = ["income", "expense", "receivable", "payable"] as const
const isAccountingClassification = (value: unknown): value is AccountingClassification =>
    isOneOf(value, ACCOUNTING_CLASSIFICATIONS)
const isAccountingClassifications = (value: unknown): value is ReadonlyArray<AccountingClassification> =>
    Array.isArray(value) && value.every(isAccountingClassification)
type AccountingIntakePolicy = {
    readonly currency: string
    readonly classifications: ReadonlyArray<AccountingClassification>
}
/** Minimal message formatter accepted by the Accounting controller. */
export type AccountingTranslation = (key: string, values?: TranslationValues) => string
/** Accessible settled command feedback projected into the pure view. */
export type AccountingNotice = { readonly kind: "success" | "refused"; readonly message: string }
/** Refusals interrupt the current task; confirmations remain non-disruptive. */
export const accountingNoticeLive = (kind: AccountingNotice["kind"]): "assertive" | "polite" =>
    kind === "refused" ? "assertive" : "polite"
/** Narrow only the Setup facts that authorize document intake; every command remains server-authorized. */
export const accountingIntakePolicy = (snapshot: unknown): AccountingIntakePolicy | null => {
    if (!isRecord(snapshot)) return null
    const scope = snapshot.accountingScope
    const currencyAndLocale = snapshot.currencyAndLocale
    if (!isRecord(scope) || !isRecord(currencyAndLocale)) return null
    const rawClassifications = scope.classifications
    const currency = currencyAndLocale.functionalCurrency
    if (
        !isAccountingClassifications(rawClassifications) ||
        rawClassifications.length === 0 ||
        typeof currency !== "string" ||
        !/^[A-Z]{3}$/.test(currency) ||
        currency === "XXX" ||
        currency === "XTS"
    )
        return null
    const classifications = [...new Set(rawClassifications)]
    if (classifications.length !== rawClassifications.length) return null
    return { currency, classifications }
}
type CorrectionAccessReason =
    | "allowed"
    | "historical"
    | "not-owner"
    | "not-approver"
    | "advisory-denied"
    | "not-pending"
    | "self-assigned"
    | "period-not-open"
/** Advisory facts used to project safe correction controls for one exact proposal. */
export type CorrectionAccessInput = {
    readonly explicitLedgerVersion: boolean
    readonly role?: AccountingViewerRole
    readonly canSubmitCorrection?: boolean
    readonly canApproveCorrection?: boolean
    readonly correction?: Pick<
        AccountingCorrection,
        "status" | "effectivePeriodKey" | "submittedByUserId" | "approverUserId"
    >
    readonly periods?: ReadonlyArray<Pick<AccountingPeriod, "periodKey" | "status">>
}
/** Closed document-state projection matching the backend lifecycle. */
export const accountingDocumentAction = (
    status: string,
    role?: AccountingViewerRole,
): "submit" | "approve" | "post" | null => {
    if (status === "draft" && role === "owner") return "submit"
    if (status === "submitted" && role === "approver") return "approve"
    if (status === "approved" && role === "owner") return "post"
    return null
}
/** Project correction controls without treating capabilities as transactional authorization. */
export const accountingCorrectionAccess = ({
    explicitLedgerVersion,
    role,
    canSubmitCorrection,
    canApproveCorrection,
    correction,
    periods = [],
}: CorrectionAccessInput): {
    readonly submit: boolean
    readonly approve: boolean
    readonly approvalReason: CorrectionAccessReason
} => {
    const submit = !explicitLedgerVersion && role === "owner" && canSubmitCorrection === true
    if (explicitLedgerVersion) return { submit: false, approve: false, approvalReason: "historical" }
    if (role !== "approver")
        return { submit, approve: false, approvalReason: role === "owner" ? "not-owner" : "not-approver" }
    if (canApproveCorrection !== true) return { submit, approve: false, approvalReason: "advisory-denied" }
    if (correction === undefined || correction.status !== "pending")
        return { submit, approve: false, approvalReason: "not-pending" }
    if (correction.approverUserId === correction.submittedByUserId)
        return { submit, approve: false, approvalReason: "self-assigned" }
    if (!periods.some((period) => period.periodKey === correction.effectivePeriodKey && period.status === "open"))
        return { submit, approve: false, approvalReason: "period-not-open" }
    return { submit, approve: true, approvalReason: "allowed" }
}

type LocalizedDigits = {
    readonly toAscii: ReadonlyMap<string, string>
    readonly fromAscii: ReadonlyMap<string, string>
}

const localizedDigits = (format: Formatter): LocalizedDigits => {
    const toAscii = new Map<string, string>()
    const fromAscii = new Map<string, string>()
    for (let digit = 0; digit <= 9; digit += 1) {
        const ascii = String(digit)
        const localized = format.number(digit, { useGrouping: false, maximumFractionDigits: 0 })
        toAscii.set(localized, ascii)
        fromAscii.set(ascii, localized)
    }
    return { toAscii, fromAscii }
}

const replaceDigits = (value: string, mapping: ReadonlyMap<string, string>): string =>
    [...value].map((character) => mapping.get(character) ?? character).join("")

const decimalSeparator = (format: Formatter, digits: LocalizedDigits): string => {
    const sample = replaceDigits(
        format.number(1.1, { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        digits.toAscii,
    )
    const firstDigit = sample.indexOf("1")
    const lastDigit = sample.lastIndexOf("1")
    return lastDigit > firstDigit ? sample.slice(firstDigit + 1, lastDigit) : "."
}

const groupingSeparator = (format: Formatter, digits: LocalizedDigits): string | undefined => {
    const sample = replaceDigits(format.number(1000, { useGrouping: true, maximumFractionDigits: 0 }), digits.toAscii)
    return /[0-9]([^0-9]+)[0-9]/u.exec(sample)?.[1]
}

const fractionDigits = (currency: string, format: Formatter, digits: LocalizedDigits): number => {
    const sample = replaceDigits(format.number(1, { style: "currency", currency }), digits.toAscii)
    const decimal = decimalSeparator(format, digits)
    const decimalIndex = sample.indexOf(decimal)
    if (decimalIndex === -1) return 0
    return /^[0-9]*/u.exec(sample.slice(decimalIndex + decimal.length))?.[0].length ?? 0
}

/** Convert a locale-entered major-unit amount into the backend's exact signed minor-unit string. */
export const currencyAmountToMinor = (value: string, currency: string, format: Formatter): string | null => {
    const digits = localizedDigits(format)
    const group = groupingSeparator(format, digits)
    const decimal = decimalSeparator(format, digits)
    let normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "")
    if (group !== undefined) normalized = normalized.split(group).join("")
    normalized = normalized.split(decimal).join(".")
    const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(normalized)
    if (match === null) return null
    const fractionDigitCount = fractionDigits(currency, format, digits)
    const fraction = match[3] ?? ""
    if (fraction.length > fractionDigitCount) return null
    const absolute =
        `${match[2]}${(fraction + "0".repeat(fractionDigitCount)).slice(0, fractionDigitCount)}`.replace(
            /^0+(?=\d)/,
            "",
        ) || "0"
    if (absolute === "0") return "0"
    return `${match[1]}${absolute}`
}
/** Format a backend minor-unit string as exact localized business currency. */
export const formatMinorCurrency = (value: string, currency: string, format: Formatter): string => {
    try {
        const match = /^(-?)(\d+)$/.exec(value)
        const rawDigits = match?.[2]
        if (match === null || rawDigits === undefined) throw new Error("amount")
        const negative = match[1] === "-" && !/^0+$/.test(rawDigits)
        const absolute = rawDigits.replace(/^0+(?=\d)/, "") || "0"
        const localized = localizedDigits(format)
        const fractionDigitCount = fractionDigits(currency, format, localized)
        const padded = absolute.padStart(fractionDigitCount + 1, "0")
        const whole = fractionDigitCount === 0 ? padded : padded.slice(0, -fractionDigitCount)
        const fraction = fractionDigitCount === 0 ? "" : padded.slice(-fractionDigitCount)
        const template = replaceDigits(
            format.number(negative ? -1 : 1, {
                style: "currency",
                currency,
                minimumFractionDigits: fractionDigitCount,
                maximumFractionDigits: fractionDigitCount,
            }),
            localized.toAscii,
        )
        const firstDigit = template.search(/[0-9]/u)
        let lastDigit = template.length - 1
        while (lastDigit >= 0 && !/[0-9]/u.test(template[lastDigit] ?? "")) lastDigit -= 1
        if (firstDigit === -1 || lastDigit < firstDigit) throw new Error("amount")
        const prefix = template.slice(0, firstDigit)
        const suffix = template.slice(lastDigit + 1)
        const group = groupingSeparator(format, localized) ?? ","
        const groupedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group)
        const decimal = decimalSeparator(format, localized)
        const formattedWhole = replaceDigits(groupedWhole, localized.fromAscii)
        const formattedFraction = replaceDigits(fraction, localized.fromAscii)
        return `${prefix}${formattedWhole}${fractionDigitCount === 0 ? "" : `${decimal}${formattedFraction}`}${suffix}`
    } catch {
        return `${value} ${currency}`
    }
}
/** Convert the business month control value into the canonical backend month key. */
export const canonicalMonthKey = (month: string): string | null =>
    /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? `${month}-01` : null
/** Convert evidence bytes without asking a person to handle base64. */
export const bytesToBase64 = (bytes: Uint8Array): string => {
    let binary = ""
    for (let offset = 0; offset < bytes.length; offset += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
    return globalThis.btoa(binary)
}
/** Keep participant identity recognizable without making the raw id a primary control label. */
export const maskParticipantId = (userId: string): string =>
    userId.length <= 8 ? `${userId.slice(0, 2)}…${userId.slice(-2)}` : `${userId.slice(0, 4)}…${userId.slice(-4)}`
/** Offer only current ledger tips that do not already have a correction proposal. */
export const eligibleCorrectionSourceEntries = (
    ledger: ReadonlyArray<AccountingLedgerEntry>,
    corrections: ReadonlyArray<Pick<AccountingCorrection, "sourceEntryId">>,
): ReadonlyArray<AccountingLedgerEntry> => {
    const supersededIds = new Set(
        ledger.flatMap((entry) => (entry.correctionOfId === null ? [] : [entry.correctionOfId])),
    )
    const proposedIds = new Set(corrections.map((correction) => correction.sourceEntryId))
    return ledger.filter((entry) => !supersededIds.has(entry.id) && !proposedIds.has(entry.id))
}

/*
 * THE ACCEPTED ui.accounting.workbench VOCABULARY.
 *
 * The six surfaces below are the accepted regions of the Accounting workbench. Each renders one
 * standing of its read: loading while the read is in flight, denied when the receiver refused
 * access, unavailable when it could not answer, empty when it answered nothing to show, and ready
 * when it answered content. Nothing here decides a domain fact; a value arrives already measured or
 * already named unknown, and a state arrives already closed.
 */

/** The accepted Accounting workbench surfaces, in the order the page reads them. */
export const ACCOUNTING_SURFACES = [
    "overview",
    "source-intake",
    "routine-progress",
    "material-question",
    "result-detail",
    "forward-correction",
] as const
/** One accepted Accounting workbench surface. */
export type AccountingSurface = (typeof ACCOUNTING_SURFACES)[number]
/** What one surface's read settled into, in the terms the block renders. */
export type AccountingSurfaceStanding = "loading" | "denied" | "unavailable" | "empty" | "ready"
/** One Accounting read's answer, as much of it as a standing depends on. */
export type AccountingAnswerStanding = Outcome<unknown>

/*
 * A refusal is not one thing. A `refused` or `forbidden` answer hides protected content
 * and is the only kind the surface calls denied; a stale authority, a conflict, a malformed answer
 * or an unreachable route is an outage the operator can retry, and telling them they lost access
 * would be a lie. An absent answer is a read in flight, never an empty one.
 */

/**
 * Project one read's standing from its answer.
 *
 * @param answer - The read's answer, or undefined while it is still in flight.
 * @param hasContent - Whether the answered payload carries anything to show.
 * @returns The standing the surface renders.
 */
export const accountingSurfaceStanding = (
    answer: AccountingAnswerStanding | undefined,
    hasContent: boolean,
): AccountingSurfaceStanding => {
    if (answer === undefined) return "loading"
    if (!answer.ok) return answer.kind === "refused" || answer.kind === "forbidden" ? "denied" : "unavailable"
    return hasContent ? "ready" : "empty"
}

/** A whole minor-unit amount, formatted exactly as the business currency is written. */
export const formatAccountingMinor = (amountMinor: number, currency: string, format: Formatter): string =>
    formatMinorCurrency(String(amountMinor), currency, format)

/** The canonical half-open period one business month control selects, or null for an unusable value. */
export const accountingMonthPeriod = (
    month: string,
): { readonly periodStart: string; readonly periodEndExclusive: string } | null => {
    const periodStart = canonicalMonthKey(month)
    if (periodStart === null) return null
    const year = Number(periodStart.slice(0, 4))
    const monthIndex = Number(periodStart.slice(5, 7))
    const next = monthIndex === 12 ? { year: year + 1, month: 1 } : { year, month: monthIndex + 1 }
    return { periodStart, periodEndExclusive: `${next.year}-${String(next.month).padStart(2, "0")}-01` }
}

/** The UTC month a fresh workbench opens on, as the month control words it. */
export const accountingUtcMonth = (now: Date): string =>
    `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`

/** One instant as the operator reads it, always at the zone the period is measured in. */
export const formatAccountingInstant = (value: string, format: Formatter): string => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return format.dateTime(parsed, { dateStyle: "short", timeStyle: "short", timeZone: "UTC" })
}

/** One canonical period start as the operator reads it. */
export const formatAccountingPeriod = (periodStart: string, format: Formatter): string => {
    const parsed = new Date(`${periodStart}T00:00:00Z`)
    if (Number.isNaN(parsed.getTime())) return periodStart
    return format.dateTime(parsed, { month: "short", year: "numeric", timeZone: "UTC" })
}

/** A closed measure kind's label key. */
const mappedMessageKey = (mapping: Readonly<Partial<Record<string, string>>>, key: string): string | undefined =>
    mapping[key]

const ACCOUNTING_MEASURE_KEYS = {
    "cash-in": "measure.cashIn",
    "cash-out": "measure.cashOut",
    "recognized-revenue": "measure.revenue",
    "recognized-cost": "measure.cost",
    unpaid: "measure.unpaid",
    "estimated-tax": "measure.estimatedTax",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key naming one accounting measure kind, or the generic measure label for a kind the workbench does not know. */
export const accountingMeasureKey = (kind: string): string =>
    mappedMessageKey(ACCOUNTING_MEASURE_KEYS, kind) ?? "measure.other"

/** A measured amount or the reason it is not shown; never a zero standing in for an unknown. */
export type AccountingMeasureReading =
    { readonly amountMinor: number; readonly currency: string } | { readonly reasonCode: string }
/** One measure payload, as much of it as a reading depends on. */
export type AccountingMeasureSource = {
    readonly status: string
    readonly amountMinor?: number | null
    readonly currency?: string | null
    readonly reasonCode?: string | null
}

/** The amount one measure may show, or the closed reason it shows instead. */
export const accountingMeasureReading = (measure: AccountingMeasureSource): AccountingMeasureReading =>
    measure.status === "known" && typeof measure.amountMinor === "number" && typeof measure.currency === "string"
        ? { amountMinor: measure.amountMinor, currency: measure.currency }
        : {
              reasonCode:
                  typeof measure.reasonCode === "string" && measure.reasonCode.length > 0
                      ? measure.reasonCode
                      : "unknown",
          }

/** A closed availability label's message key. */
const ACCOUNTING_AVAILABILITY_KEYS = {
    current: "availability.current",
    partial: "availability.partial",
    stale: "availability.stale",
    unavailable: "availability.unavailable",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key for how current a measure reading is; an unknown availability reads as unavailable. */
export const accountingAvailabilityKey = (availability: string): string =>
    mappedMessageKey(ACCOUNTING_AVAILABILITY_KEYS, availability) ?? "availability.unavailable"

/** A closed partial-coverage reason's message key. */
const ACCOUNTING_PARTIAL_REASON_KEYS = {
    "missing-occurred-on": "attention.missingOccurredOn",
    "missing-measure-coverage": "partialReason.missingMeasureCoverage",
    "stale-source": "partialReason.staleSource",
    "unavailable-source": "partialReason.unavailableSource",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key for why a measure covers only part of the ledger; an unknown reason reads as an unavailable source. */
export const accountingPartialReasonKey = (reason: string): string =>
    mappedMessageKey(ACCOUNTING_PARTIAL_REASON_KEYS, reason) ?? "partialReason.unavailableSource"

const ACCOUNTING_ATTENTION_KEYS = {
    "missing-receipt": "attention.missingReceipt",
    "unmatched-payment": "attention.unmatchedPayment",
    "missing-occurred-on": "attention.missingOccurredOn",
    "stale-source": "attention.staleSource",
} satisfies Readonly<Partial<Record<string, string>>>

/** One attention code's message key; a code this build does not know keeps its own text as the value. */
export const accountingAttentionKey = (code: string): string =>
    mappedMessageKey(ACCOUNTING_ATTENTION_KEYS, code) ?? "attention.other"

/** A closed evidence state's message key. */
const ACCOUNTING_EVIDENCE_STATE_KEYS = {
    admitted: "evidenceState.admitted",
    reading: "evidenceState.reading",
    ready: "evidenceState.ready",
    needs_information: "evidenceState.needsInformation",
    likely_duplicate: "evidenceState.likelyDuplicate",
    unreadable: "evidenceState.unreadable",
    rejected: "evidenceState.rejected",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key for the state of one piece of accounting evidence. */
export const accountingEvidenceStateKey = (state: string): string =>
    mappedMessageKey(ACCOUNTING_EVIDENCE_STATE_KEYS, state) ?? "evidenceState.rejected"

/** A closed routine state's message key. */
const ACCOUNTING_ROUTINE_STATE_KEYS = {
    admitted: "routineState.admitted",
    committed: "routineState.committed",
    "needs-decision": "routineState.needsDecision",
    "pending-authority": "routineState.pendingAuthority",
    denied: "routineState.denied",
    "outcome-unknown": "routineState.outcomeUnknown",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key for the run state of one accounting routine. */
export const accountingRoutineStateKey = (state: string): string =>
    mappedMessageKey(ACCOUNTING_ROUTINE_STATE_KEYS, state) ?? "routineState.outcomeUnknown"

/** A closed material-exception state's message key. */
const ACCOUNTING_EXCEPTION_STATE_KEYS = {
    open: "exceptionState.open",
    deferred: "exceptionState.deferred",
    escalated: "exceptionState.escalated",
    answered: "exceptionState.answered",
    resolved: "exceptionState.resolved",
    dismissed: "exceptionState.dismissed",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key for the review state of one accounting exception. */
export const accountingExceptionStateKey = (state: string): string =>
    mappedMessageKey(ACCOUNTING_EXCEPTION_STATE_KEYS, state) ?? "exceptionState.open"

/** A closed correction state's message key. */
const ACCOUNTING_CORRECTION_STATE_KEYS = {
    proposed: "correctionState.proposed",
    blocked: "correctionState.blocked",
    possible_start: "correctionState.possibleStart",
    applied: "correctionState.applied",
    proven_not_applied: "correctionState.provenNotApplied",
    outcome_unknown: "correctionState.outcomeUnknown",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key for the state of one proposed accounting correction. */
export const accountingCorrectionStateKey = (state: string): string =>
    mappedMessageKey(ACCOUNTING_CORRECTION_STATE_KEYS, state) ?? "correctionState.outcomeUnknown"

/** A closed payment-match status's message key. */
const ACCOUNTING_MATCH_STATUS_KEYS = {
    unpaid: "matchStatus.unpaid",
    unmatched: "matchStatus.unmatched",
    matched: "matchStatus.matched",
    ambiguous: "matchStatus.ambiguous",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key for how a ledger fact matched its counterpart record. */
export const accountingMatchStatusKey = (status: string): string =>
    mappedMessageKey(ACCOUNTING_MATCH_STATUS_KEYS, status) ?? "matchStatus.unmatched"

/** A closed treatment outcome's message key. */
const ACCOUNTING_TREATMENT_KEYS = {
    supported: "treatment.supported",
    unsupported: "treatment.unsupported",
    unknown: "treatment.unknown",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key for the accounting treatment applied to a ledger fact. */
export const accountingTreatmentKey = (kind: string): string =>
    mappedMessageKey(ACCOUNTING_TREATMENT_KEYS, kind) ?? "treatment.unknown"

/** A closed corrected-fact field's message key. */
const ACCOUNTING_FACT_FIELD_KEYS = {
    amountMinor: "fact.amount",
    currency: "fact.currency",
    occurredOn: "fact.occurredOn",
    counterpartyRef: "fact.counterparty",
    matchStatus: "fact.matchStatus",
    treatment: "fact.treatment",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key naming one field of a ledger fact; an unknown field reads as the generic fact label. */
export const accountingFactFieldKey = (field: string): string =>
    mappedMessageKey(ACCOUNTING_FACT_FIELD_KEYS, field) ?? "fact.other"

/** One tagged fact value as the operator reads it; a money value keeps its own currency. */
export const accountingFactValueText = (
    value: {
        readonly kind: string
        readonly value?: string | number | boolean
        readonly amountMinor?: number
        readonly currency?: string
    } | null,
    format: Formatter,
): string => {
    if (value === null) return "—"
    if (value.kind === "money") return formatAccountingMinor(value.amountMinor ?? 0, value.currency ?? "", format)
    if (value.kind === "boolean") return value.value === true ? "true" : "false"
    if (value.kind === "local-date" && typeof value.value === "string") {
        const parsed = new Date(`${value.value}T00:00:00Z`)
        return Number.isNaN(parsed.getTime())
            ? value.value
            : format.dateTime(parsed, { dateStyle: "short", timeZone: "UTC" })
    }
    if (value.kind === "timestamptz" && typeof value.value === "string") {
        const parsed = new Date(value.value)
        return Number.isNaN(parsed.getTime())
            ? value.value
            : format.dateTime(parsed, { dateStyle: "short", timeStyle: "short", timeZone: "UTC" })
    }
    if (typeof value.value === "number") return format.number(value.value)
    return value.value === undefined ? "—" : String(value.value)
}

/** Whether an answer left the effect unattested, which only a read of the same identity resolves. */
export const accountingEffectUnattested = (answer: AccountingAnswerStanding | undefined): boolean =>
    answer !== undefined && !answer.ok && answer.code === "outcome_unknown"

/** One command input's refusal message key. */
const ACCOUNTING_REFUSAL_KEYS = {
    forbidden: "refusal.forbidden",
    REFUSED: "refusal.forbidden",
    UNAUTHENTICATED: "refusal.signIn",
    "stale-authority": "refusal.staleAuthority",
    validation: "refusal.validation",
    conflict: "refusal.conflict",
    "outcome-unknown": "refusal.unattested",
    outcome_unknown: "refusal.unattested",
    UNREACHABLE: "refusal.unreachable",
    MALFORMED_ANSWER: "refusal.malformed",
    UNEXPECTED_RESULT_KIND: "refusal.malformed",
    UNEXPECTED_RESULT_TAG: "refusal.malformed",
    ECHOED_IDENTITY_MISMATCH: "refusal.malformed",
} satisfies Readonly<Partial<Record<string, string>>>

/** Message key explaining a refused accounting request; an unknown code reads as the unreachable-source refusal. */
export const accountingRefusalKey = (code: string): string =>
    mappedMessageKey(ACCOUNTING_REFUSAL_KEYS, code) ?? "refusal.unreachable"
