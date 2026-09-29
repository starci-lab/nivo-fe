import { describe, expect, it } from "vitest"

import {
    commandAccountingAdmitEvidence,
    commandAccountingCorrect,
    commandAccountingException,
    commandAccountingRoutine,
    readAccountingEvidence,
    readAccountingResultDetail,
    readAccountingRoutineResult,
    readAccountingSummary
} from "./index"
import { accountingSpec } from "./spec-helpers"
const { TOKEN, INTENT, SCOPE, OPERATIONS_PATH, CORE_ORIGIN, answerWith, sentUrls, sentInit, sentBody, accountingResult } = accountingSpec

describe("accounting", () => {
    it("sends each of the eight operations as exactly one bearer POST to its registered name", async () => {
        answerWith(
            200,
            accountingResult("evidence", {
                evidenceId: "evidence-1",
                state: "admitted",
                revision: 1,
                missingFacts: [],
            }),
        )
        await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)
        await readAccountingRoutineResult(TOKEN, SCOPE, { intentId: "intent-1" }, INTENT)
        await readAccountingSummary(
            TOKEN,
            SCOPE,
            {
                periodStart: "2026-09-01",
                periodEndExclusive: "2026-10-01",
                currency: "VND",
                pageSize: 25,
                cursor: null,
            },
            INTENT,
        )
        await readAccountingResultDetail(TOKEN, SCOPE, { action: "current", resultId: "result-1" }, INTENT)
        await commandAccountingAdmitEvidence(
            TOKEN,
            SCOPE,
            {
                evidenceId: "evidence-1",
                sourceKind: "statement-import",
                sourceRef: "s3://source-1",
                sourceRevision: "2",
                fingerprint: "fingerprint-1",
                expectedRevision: 1,
            },
            INTENT,
        )
        await commandAccountingRoutine(
            TOKEN,
            SCOPE,
            {
                action: "commit",
                itemId: "item-1",
                evidenceIds: ["evidence-1"],
                intentId: "intent-1",
                policyRevision: "policy-1",
                expectedItemRevision: 3,
            },
            INTENT,
        )
        await commandAccountingException(
            TOKEN,
            SCOPE,
            {
                action: "answer",
                exceptionId: "exception-1",
                answer: { choiceCode: "code-1", suppliedFacts: [], reason: null },
                answerEvidenceRefs: [],
                expectedRevision: 4,
            },
            INTENT,
        )
        await commandAccountingCorrect(
            TOKEN,
            SCOPE,
            { action: "append", correctionId: "correction-1", attemptId: "attempt-1", expectedRevision: 1 },
            INTENT,
        )

        expect(sentUrls()).toEqual([
            `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.evidence@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.routineResult@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.summary@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.resultDetail@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.admitEvidence@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.routine@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.exception@1`,
            `${CORE_ORIGIN}${OPERATIONS_PATH}accounting.correct@1`,
        ])
        for (const index of [0, 1, 2, 3, 4, 5, 6, 7]) {
            expect(sentInit(index).method).toBe("POST")
            expect(sentInit(index).credentials).toBe("omit")
            expect(sentInit(index).headers).toEqual({
                authorization: `Bearer ${TOKEN}`,
                "content-type": "application/json",
            })
            expect(sentBody(index).requestId).toBe(INTENT)
        }
        expect(sentBody(2).input).toEqual({
            op: "summary",
            input: {
                periodStart: "2026-09-01",
                periodEndExclusive: "2026-10-01",
                currency: "VND",
                pageSize: 25,
                cursor: null,
            },
        })
        expect(sentBody(5).input).toEqual({
            op: "routine",
            input: {
                action: "commit",
                itemId: "item-1",
                evidenceIds: ["evidence-1"],
                intentId: "intent-1",
                policyRevision: "policy-1",
                expectedItemRevision: 3,
            },
        })
        expect(accountingSpec.fetchMock).toHaveBeenCalledTimes(8)
    })

})
