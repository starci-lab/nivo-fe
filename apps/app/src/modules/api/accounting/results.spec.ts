import { describe, expect, it } from "vitest"

import {
    commandAccountingAdmitEvidence,
    commandAccountingException,
    commandAccountingRoutine,
    readAccountingEvidence,
    readAccountingSummary
} from "./index"
import { accountingSpec } from "./spec-helpers"
const { TOKEN, INTENT, SCOPE, answerWith, accountingResult } = accountingSpec

describe("accounting", () => {
    it("hands the receiver's own tagged variant through on success", async () => {
        answerWith(
            200,
            accountingResult("evidence", {
                evidenceId: "evidence-1",
                state: "reading",
                revision: 2,
                missingFacts: ["fingerprint"],
            }),
        )
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toEqual({
            ok: true,
            data: {
                op: "evidence",
                payload: { evidenceId: "evidence-1", state: "reading", revision: 2, missingFacts: ["fingerprint"] },
            },
        })
    })

    it("keeps an unknown outcome unknown, names the matching read, and never re-sends", async () => {
        answerWith(200, { kind: "outcome_unknown", operation: "accounting.routine@1", requestId: INTENT })
        expect(
            await commandAccountingRoutine(
                TOKEN,
                SCOPE,
                {
                    action: "retry",
                    intentId: "intent-1",
                    oldAttemptId: "attempt-1",
                    notStartedProofRef: "proof-1",
                    newAttemptId: "attempt-2",
                },
                INTENT,
            ),
        ).toMatchObject({
            ok: false,
            code: "outcome_unknown",
            operation: "accounting.routine@1",
            requestId: INTENT,
            reconciles: "accounting.routineResult@1",
        })
        expect(accountingSpec.fetchMock).toHaveBeenCalledTimes(1)
    })

    it("treats a receiver outcome-unknown failure as the same unknown rather than a refusal", async () => {
        answerWith(200, {
            kind: "accounting_result",
            operation: "accounting.admitEvidence@1",
            requestId: INTENT,
            result: {
                ok: false,
                failure: { op: "admitEvidence", error: "outcome-unknown", reasonCode: "controlplane-wait" },
            },
        })
        expect(
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
            ),
        ).toMatchObject({
            ok: false,
            code: "outcome_unknown",
            operation: "accounting.admitEvidence@1",
            requestId: INTENT,
            reconciles: "accounting.evidence@1",
        })
    })

    it("names no read for a command whose surface registers none", async () => {
        answerWith(200, { kind: "outcome_unknown", operation: "accounting.exception@1", requestId: INTENT })
        const answer = await commandAccountingException(
            TOKEN,
            SCOPE,
            { action: "defer", exceptionId: "exception-1", reason: "awaiting owner", expectedRevision: 4 },
            INTENT,
        )
        expect(answer).toMatchObject({
            ok: false,
            code: "outcome_unknown",
            operation: "accounting.exception@1",
            requestId: INTENT,
            reconciles: null,
        })
    })

    it("keeps a deadline a refusal that still names the read of the same identity", async () => {
        answerWith(200, { kind: "DEADLINE_EXCEEDED", reason: "core-wait" })
        const answer = await commandAccountingRoutine(
            TOKEN,
            SCOPE,
            {
                action: "retry",
                intentId: "intent-1",
                oldAttemptId: "attempt-1",
                notStartedProofRef: "proof-1",
                newAttemptId: "attempt-2",
            },
            INTENT,
        )
        expect(answer).toMatchObject({
            ok: false,
            code: "DEADLINE_EXCEEDED",
            operation: "accounting.routine@1",
            requestId: INTENT,
            reason: "core-wait",
            reconciles: "accounting.routineResult@1",
        })
        expect(accountingSpec.fetchMock).toHaveBeenCalledTimes(1)
    })

    it("refuses an unregistered installation operation by its closed name", async () => {
        answerWith(200, { kind: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION", reason: "not-installed" })
        const answer = await readAccountingSummary(
            TOKEN,
            SCOPE,
            { periodStart: "2026-09-01", periodEndExclusive: "2026-10-01", currency: null, pageSize: 25, cursor: null },
            INTENT,
        )
        expect(answer).toMatchObject({
            ok: false,
            code: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION",
            operation: "accounting.summary@1",
            reason: "not-installed",
        })
    })

    it("never translates another module's result kind", async () => {
        answerWith(200, {
            kind: "sales_result",
            operation: "accounting.summary@1",
            requestId: INTENT,
            result: { ok: true, result: { op: "summary", payload: {} } },
        })
        expect(
            await readAccountingSummary(
                TOKEN,
                SCOPE,
                {
                    periodStart: "2026-09-01",
                    periodEndExclusive: "2026-10-01",
                    currency: null,
                    pageSize: 25,
                    cursor: null,
                },
                INTENT,
            ),
        ).toMatchObject({ ok: false, code: "UNEXPECTED_RESULT_KIND" })
    })

    it("refuses a variant that is not the one the operation asked for", async () => {
        answerWith(200, {
            kind: "accounting_result",
            operation: "accounting.evidence@1",
            requestId: INTENT,
            result: { ok: true, result: { op: "summary", payload: {} } },
        })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "UNEXPECTED_RESULT_TAG",
        })
    })

    it("maps every failure to one shared outcome kind, so a screen never reads a status off a code", async () => {
        const summary = {
            periodStart: "2026-09-01",
            periodEndExclusive: "2026-10-01",
            currency: null,
            pageSize: 25,
            cursor: null,
        }
        const kindOf = async (status: number, body: unknown) => {
            answerWith(status, body)
            const answer = await readAccountingSummary(TOKEN, SCOPE, summary, INTENT)
            return answer.ok ? "ok" : answer.kind
        }
        const failure = (error: string) => ({
            kind: "accounting_result",
            operation: "accounting.summary@1",
            requestId: INTENT,
            result: { ok: false, failure: { error, reasonCode: "r" } },
        })
        expect(await kindOf(200, failure("forbidden"))).toBe("forbidden")
        expect(await kindOf(200, failure("validation"))).toBe("invalid")
        expect(await kindOf(200, failure("conflict"))).toBe("invalid")
        expect(await kindOf(200, failure("stale-authority"))).toBe("unavailable")
        expect(await kindOf(200, failure("outcome-unknown"))).toBe("unavailable")
        expect(await kindOf(200, { kind: "REFUSED", reason: "no" })).toBe("forbidden")
        expect(await kindOf(200, { kind: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION", reason: "no" })).toBe("not-found")
        expect(await kindOf(401, {})).toBe("refused")
        accountingSpec.fetchMock.mockRejectedValueOnce(new Error("offline"))
        expect(await readAccountingSummary(TOKEN, SCOPE, summary, INTENT)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "UNREACHABLE",
            retryable: true,
        })
        expect(await readAccountingSummary(null, SCOPE, summary, INTENT)).toMatchObject({
            ok: false,
            kind: "refused",
            code: "UNAUTHENTICATED",
        })
    })

    it("refuses a result kind the route does not declare", async () => {
        answerWith(200, { kind: "someday_new_kind", reason: "unknown" })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "UNEXPECTED_RESULT_KIND",
        })
    })

    it("refuses an answer that echoes an identity this call did not send", async () => {
        answerWith(200, {
            kind: "accounting_result",
            operation: "accounting.evidence@1",
            requestId: "another-intent",
            result: { ok: true, result: { op: "evidence", payload: {} } },
        })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "ECHOED_IDENTITY_MISMATCH",
        })
    })


})
