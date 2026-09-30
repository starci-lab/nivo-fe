import { describe, expect, it } from "vitest"

import {
    isCommandPayloadState,
    parseAccountingCorrectionReading,
    parseAccountingEvidenceReading,
    parseAccountingExceptionReading,
    parseAccountingResult,
    parseAccountingResultDetailReading,
    parseAccountingRoutineReading,
    parseAccountingSummaryReading,
} from "./payload.guards"

describe("parseAccountingResult", () => {
    it("parses a well-formed tagged evidence result", () => {
        const evidence = {
            evidenceId: "e-1",
            state: "ready",
            revision: 1,
            missingFacts: [],
        }
        expect(parseAccountingResult({ op: "evidence", payload: evidence })).toEqual({
            op: "evidence",
            payload: evidence,
        })
    })

    it("refuses a malformed payload: wrong primitive, unknown op, or a payload that fails its shape", () => {
        expect(parseAccountingResult(null)).toBeNull()
        expect(parseAccountingResult({ op: "unknownOp", payload: {} })).toBeNull()
        expect(
            parseAccountingResult({ op: "evidence", payload: { evidenceId: "e-1", state: "half-read", revision: 1, missingFacts: [] } }),
        ).toBeNull()
        expect(
            parseAccountingResult({ op: "summary", payload: { periodStart: "a", periodEndExclusive: "b", items: [{}], partialReasons: [] } }),
        ).toBeNull()
        expect(
            parseAccountingResult({
                op: "routine",
                payload: {
                    intentId: "i",
                    itemId: null,
                    attemptId: null,
                    state: "settled",
                    receiptId: null,
                    resultId: null,
                    reasonCode: null,
                },
            }),
        ).toBeNull()
    })
})

describe("Accounting payload readings", () => {
    it("parses each reading shape through the tagged result parser", () => {
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

describe("isCommandPayloadState", () => {
    it("accepts only payloads with the optional settlement fields in their declared shape", () => {
        expect(isCommandPayloadState({ state: "ready", resultId: "result-1" })).toBe(true)
        expect(isCommandPayloadState({})).toBe(true)
        expect(isCommandPayloadState({ state: 1 })).toBe(false)
        expect(isCommandPayloadState(null)).toBe(false)
    })
})
