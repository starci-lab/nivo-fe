import { describe, expect, it } from "vitest"

import { parseAccountingResult } from "./payload.guards"

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
