import type { AccountingSummaryItemPayload } from "@/modules/api/accounting"
import { accountingMeasureReading } from "@/modules/accounting/accounting-workbench"

/** A known amount and currency pair from one covered accounting measure. */
export type AccountingKnownMeasureReading = {
    readonly amountMinor: number
    readonly currency: string
}

/** A measure band is withheld when any covered item lacks a reading. */
export type AccountingMeasureBandReading =
    | { readonly amountMinor: number; readonly currency: string; readonly covered: number }
    | { readonly reasonCode: string }
    | null

/** Status tones used by accounting evidence and operation readbacks. */
export type AccountingBadgeTone = "success" | "warning" | "neutral"

type AccountingSubmitEvent = { readonly preventDefault: () => void }

/** Read one complete period total or report the first reason it is partial. */
export const accountingMeasureBand = (
    items: ReadonlyArray<AccountingSummaryItemPayload>,
    kind: string,
): AccountingMeasureBandReading => {
    const readings = items.map((item) => {
        const measure = item.measures.find((candidate) => candidate.kind === kind)
        return measure === undefined ? { reasonCode: "not-covered" } : accountingMeasureReading(measure)
    })
    if (readings.length === 0) return null
    const unknown = readings.find(
        (reading): reading is { readonly reasonCode: string } => "reasonCode" in reading,
    )
    if (unknown !== undefined) return unknown
    const known = readings.filter((reading): reading is AccountingKnownMeasureReading => "amountMinor" in reading)
    const firstKnown = known[0]
    if (firstKnown === undefined) return null
    const currencies = new Set(known.map((reading) => reading.currency))
    if (currencies.size !== 1) return { reasonCode: "mixed-currency" }
    return {
        amountMinor: known.reduce((total, reading) => total + reading.amountMinor, 0),
        currency: firstKnown.currency,
        covered: known.length,
    }
}

/** Resolve a backend state into the one presentation tone configured for its map. */
export const accountingToneFor = (
    tones: Readonly<Record<string, AccountingBadgeTone>>,
    state: string,
): AccountingBadgeTone => tones[state] ?? "neutral"

/** Evidence intake states and their semantic badge tones. */
export const ACCOUNTING_EVIDENCE_TONES: Readonly<Record<string, AccountingBadgeTone>> = {
    admitted: "success",
    accepted: "success",
    needs_information: "warning",
    likely_duplicate: "warning",
    refused: "warning",
}

/** Routine commit states and their semantic badge tones. */
export const ACCOUNTING_ROUTINE_TONES: Readonly<Record<string, AccountingBadgeTone>> = {
    committed: "success",
    denied: "warning",
}

/** Correction states and their semantic badge tones. */
export const ACCOUNTING_CORRECTION_TONES: Readonly<Record<string, AccountingBadgeTone>> = {
    applied: "success",
    blocked: "warning",
}

/** Prevent the browser submit default and invoke the settled operation action. */
export const accountingSubmitOn = (handler: () => void) => (event: AccountingSubmitEvent) => {
    event.preventDefault()
    handler()
}
