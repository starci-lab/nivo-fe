import fs from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { graphql } = vi.hoisted(() => ({ graphql: vi.fn() }))
vi.mock("./graphql", () => ({ graphql }))

import {
    ACCOUNTING_COMMAND_RECONCILIATIONS,
    commandAccountingAdmitEvidence,
    commandAccountingCorrect,
    commandAccountingException,
    commandAccountingRoutine,
    readAccountingEvidence,
    readAccountingResultDetail,
    readAccountingRoutineResult,
    readAccountingSummary,
} from "./accounting"

/*
 * THE SURFACE IS CLOSED.
 *
 * fe-modules-impl 3/9 removed the legacy GraphQL document workbench from this client and from the two
 * SWR hook modules. What is asserted here is the removal itself: the eight accounting operation names
 * are the whole public surface, and nothing in this module resolves an Accounting fact through a
 * GraphQL document, an approve call or a post call.
 */
describe("ACCOUNTING_COMMAND_RECONCILIATIONS", () => {
    it("exports the eight operations, and nothing that resolves Accounting through GraphQL", async () => {
        const client = await import("./accounting")
        expect(
            Object.keys(client)
                .filter((name) => /^(read|command)Accounting/.test(name))
                .sort(),
        ).toEqual([
            "commandAccountingAdmitEvidence",
            "commandAccountingCorrect",
            "commandAccountingException",
            "commandAccountingRoutine",
            "readAccountingEvidence",
            "readAccountingResultDetail",
            "readAccountingRoutineResult",
            "readAccountingSummary",
        ])
        expect(
            Object.keys(client).filter((name) =>
                /Document|Workbench|Correction|Initialize|Ingest|Reconcile|ClosePeriod|AppliedAccountingContext/.test(
                    name,
                ),
            ),
        ).toEqual([])
        expect(ACCOUNTING_COMMAND_RECONCILIATIONS).toEqual({
            "accounting.admitEvidence@1": "accounting.evidence@1",
            "accounting.routine@1": "accounting.routineResult@1",
            "accounting.correct@1": "accounting.resultDetail@1",
        })
    })

    it("keeps no GraphQL document, approve or post call in the Accounting client source", () => {
        const clientPath = [
            `${process.cwd()}/apps/app/src/modules/api/accounting.ts`,
            `${process.cwd()}/src/modules/api/accounting.ts`,
        ].find((candidate) => fs.existsSync(candidate))
        if (clientPath === undefined) throw new Error("the Accounting client source is not on this lane's path")
        const source = fs.readFileSync(clientPath, "utf8")
        expect(source).not.toContain('from "./graphql"')
        expect(graphql).not.toHaveBeenCalled()
        for (const removed of [
            "resolveAppliedAccountingContext",
            "readAccountingWorkbench",
            "initializeAccounting",
            "ingestAccountingDocument",
            "submitAccountingDocument",
            "approveAccountingDocument",
            "postAccountingDocument",
            "reconcileAccounting",
            "closeAccountingPeriod",
            "submitAccountingCorrection",
            "approveAccountingCorrection",
            "narrowWorkbench",
        ]) {
            expect(source).not.toContain(removed)
        }
    })
})

/* -------------------------------------------------------------------------------------------------
 * The installation operation client: one bearer POST per operation, and no answer promoted.
 * ----------------------------------------------------------------------------------------------- */

const WORKSPACE = "11111111-1111-4111-8111-111111111111"
const INSTANCE = "22222222-2222-4222-8222-222222222222"
const INSTALLATION = "33333333-3333-4333-8333-333333333333"
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.access-token.signature"
const INTENT = "b7b7c1f0-1f4a-4a3e-9a2b-3a1c5d6e7f80"
const SCOPE = { workspaceId: WORKSPACE, instanceId: INSTANCE, installationId: INSTALLATION }
const OPERATIONS_PATH = `/api/v1/agentos/workspaces/${WORKSPACE}/instances/${INSTANCE}/installations/${INSTALLATION}/operations/`
const CORE_ORIGIN = new URL(process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql").origin

let fetchMock: ReturnType<typeof vi.fn>

const answerWith = (status: number, body: unknown): void => {
    fetchMock.mockResolvedValue({ status, json: async () => body })
}
const sentUrls = (): Array<string> => fetchMock.mock.calls.map((call) => String(call[0]))
const sentInit = (index = 0): RequestInit => fetchMock.mock.calls[index]?.[1] as RequestInit
const sentBody = (index = 0): Record<string, unknown> =>
    JSON.parse(String(sentInit(index).body)) as Record<string, unknown>
const accountingResult = (op: string, payload: Record<string, unknown>) => ({
    kind: "accounting_result",
    operation: "accounting.evidence@1",
    requestId: INTENT,
    result: { ok: true, result: { op, payload } },
})

beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

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
        expect(fetchMock).toHaveBeenCalledTimes(8)
    })

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
        expect(fetchMock).toHaveBeenCalledTimes(1)
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
        expect(fetchMock).toHaveBeenCalledTimes(1)
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
        fetchMock.mockRejectedValueOnce(new Error("offline"))
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

    it("sends nothing at all without an access token", async () => {
        expect(await readAccountingEvidence(null, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "UNAUTHENTICATED",
            requestId: null,
        })
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("refuses an intent identity the route itself would reject, before any request", async () => {
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, "")).toMatchObject({
            ok: false,
            code: "BAD_REQUEST",
        })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, "x".repeat(513))).toMatchObject(
            { ok: false, code: "BAD_REQUEST" },
        )
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("reports a refused bearer token as UNAUTHENTICATED rather than as a served answer", async () => {
        answerWith(401, { kind: "UNAUTHENTICATED" })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "UNAUTHENTICATED",
        })
    })

    it("fails closed when the transport or the body is not an answer at all", async () => {
        fetchMock.mockRejectedValueOnce(new Error("socket closed"))
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "UNREACHABLE",
        })
        fetchMock.mockResolvedValueOnce({
            status: 200,
            json: async () => {
                throw new Error("not json")
            },
        })
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
        answerWith(200, "not an envelope")
        expect(await readAccountingEvidence(TOKEN, SCOPE, { evidenceId: "evidence-1" }, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
    })
})
