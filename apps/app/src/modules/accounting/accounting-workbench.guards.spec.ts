import { describe, expect, it } from "vitest"
import {
    isAccountingClassifications,
    isAccountingIntakeSnapshot,
    isAccountingRecord,
    parseAccountingCorrectionReading,
    parseAccountingEvidenceReading,
    parseAccountingExceptionReading,
    parseAccountingResultDetailReading,
    parseAccountingRoutineReading,
    parseAccountingSummaryReading,
} from "./accounting-workbench.guards"

describe("Accounting workbench guards", () => {
    it("narrows setup records and closed classification lists", () => {
        expect(isAccountingRecord({ accountingScope: {} })).toBe(true)
        expect(isAccountingRecord([])).toBe(false)
        expect(isAccountingIntakeSnapshot({ accountingScope: {}, currencyAndLocale: {} })).toBe(true)
        expect(isAccountingIntakeSnapshot(null)).toBe(false)
        expect(isAccountingClassifications(["income", "expense"])).toBe(true)
        expect(isAccountingClassifications(["income", "unknown"])).toBe(false)
    })

    it("parses each Accounting reading shape before projection", () => {
        const summary = {
            periodStart: "2026-09-01",
            periodEndExclusive: "2026-10-01",
            currency: "USD",
            items: [],
            partialReasons: [],
            nextCursor: null,
        }
        const evidence = { evidenceId: "evidence-1", state: "ready", revision: 1, missingFacts: [] }
        const routine = {
            intentId: "intent-1",
            itemId: null,
            attemptId: null,
            state: "committed",
            receiptId: null,
            resultId: "result-1",
            reasonCode: null,
        }
        const exception = { exceptionId: "exception-1", state: "open", revision: 1 }
        const correction = {
            correctionId: "correction-1",
            attemptId: "attempt-1",
            state: "proposed",
            resultId: null,
            predecessorResultId: "result-1",
        }
        const detail = {
            resultId: "result-1",
            itemId: "item-1",
            version: 1,
            effectiveAt: "2026-09-30T12:00:00Z",
            state: "current",
            facts: {
                amountMinor: 1234,
                currency: "USD",
                occurredOn: null,
                counterpartyRef: null,
                matchStatus: "unpaid",
                treatment: { kind: "supported", code: "standard" },
            },
            sourceEvidenceRefs: [],
            policyRevision: "policy-1",
            receiptId: null,
            predecessorResultId: null,
            successorResultId: null,
        }

        expect(parseAccountingSummaryReading(summary)).toEqual(summary)
        expect(parseAccountingSummaryReading({ ...summary, items: [null] })).toBeNull()
        expect(parseAccountingEvidenceReading(evidence)).toEqual(evidence)
        expect(parseAccountingRoutineReading(routine)).toEqual(routine)
        expect(parseAccountingExceptionReading(exception)).toEqual(exception)
        expect(parseAccountingCorrectionReading(correction)).toEqual(correction)
        expect(parseAccountingResultDetailReading(detail)).toEqual(detail)
    })
})
