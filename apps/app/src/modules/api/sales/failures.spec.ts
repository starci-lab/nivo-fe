import { describe, expect, it } from "vitest"

import {
    commandSalesClose,
    commandSalesSubmitCommand,
    readSalesAction,
    readSalesCommand,
    readSalesHandoff,
    readSalesOpportunity,
    readSalesPolicy
} from "./index"
import { salesSpec } from "./spec-helpers"
const { TOKEN, INTENT, SCOPE, POLICY_REQUEST, OPPORTUNITY_REQUEST, COMMAND_REQUEST, ACTION_REQUEST, HANDOFF_REQUEST, SUBMIT_COMMAND_REQUEST, CLOSE_REQUEST, answerWith, served } = salesSpec

describe("sales", () => {
    it("maps every failure to one shared outcome kind, so a screen never reads a status off a code", async () => {
        const kindOf = async (status: number, body: unknown) => {
            answerWith(status, body)
            const answer = await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)
            return answer.ok ? "ok" : answer.kind
        }
        expect(
            await kindOf(200, served("sales.opportunity@1", { status: "denied", code: "SALES_OPPORTUNITY_NOT_FOUND" })),
        ).toBe("forbidden")
        expect(
            await kindOf(200, served("sales.opportunity@1", { status: "denied", code: "SALES_POLICY_VALUE_INVALID" })),
        ).toBe("invalid")
        expect(
            await kindOf(
                200,
                served("sales.opportunity@1", { status: "conflict", code: "SALES_POLICY_REVISION_CONFLICT" }),
            ),
        ).toBe("invalid")
        expect(
            await kindOf(
                200,
                served("sales.opportunity@1", { status: "unavailable", code: "SALES_READINESS_NOT_OBSERVED" }),
            ),
        ).toBe("unavailable")
        expect(
            await kindOf(200, { kind: "outcome_unknown", operation: "sales.opportunity@1", requestId: INTENT }),
        ).toBe("unavailable")
        expect(await kindOf(200, { kind: "REFUSED", reason: "no" })).toBe("forbidden")
        expect(await kindOf(200, { kind: "BAD_REQUEST", reason: "no" })).toBe("invalid")
        expect(await kindOf(200, { kind: "OPERATION_NOT_REGISTERED_FOR_INSTALLATION", reason: "no" })).toBe("not-found")
        expect(await kindOf(503, { kind: "CONTROLPLANE_UNAVAILABLE", reason: "down" })).toBe("unavailable")
        expect(await kindOf(401, {})).toBe("refused")
        salesSpec.fetchMock.mockRejectedValueOnce(new Error("offline"))
        expect(await readSalesOpportunity(TOKEN, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "UNREACHABLE",
            retryable: true,
        })
        expect(await readSalesOpportunity(null, SCOPE, OPPORTUNITY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            kind: "refused",
            code: "UNAUTHENTICATED",
        })
    })

    it("keeps every other closed route error its own name", async () => {
        for (const kind of [
            "BAD_REQUEST",
            "REFUSED",
            "UNSUPPORTED_OPERATION_VERSION",
            "CURRENT_AUTHORITY_UNAVAILABLE",
            "CONTROLPLANE_UNAVAILABLE",
        ]) {
            answerWith(200, { kind, reason: "route-reason" })
            expect(await readSalesCommand(TOKEN, SCOPE, COMMAND_REQUEST, INTENT)).toMatchObject({
                ok: false,
                code: kind,
                reason: "route-reason",
                refusal: null,
            })
        }
        expect(salesSpec.fetchMock).toHaveBeenCalledTimes(5)
    })

    it("never translates another module's result kind", async () => {
        answerWith(200, {
            kind: "accounting_result",
            operation: "sales.policy@1",
            requestId: INTENT,
            result: { ok: true, result: { op: "policy", payload: {} } },
        })
        expect(await readSalesPolicy(TOKEN, SCOPE, POLICY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "UNEXPECTED_RESULT_KIND",
        })
    })

    it("refuses a result kind the route does not declare", async () => {
        answerWith(200, { kind: "someday_new_kind", reason: "unknown" })
        expect(await readSalesHandoff(TOKEN, SCOPE, HANDOFF_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "UNEXPECTED_RESULT_KIND",
        })
    })

    it("refuses an answer that echoes an identity this call did not send", async () => {
        answerWith(200, { kind: "outcome_unknown", operation: "sales.close@1", requestId: INTENT })
        expect(await commandSalesSubmitCommand(TOKEN, SCOPE, SUBMIT_COMMAND_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "ECHOED_IDENTITY_MISMATCH",
        })
        answerWith(200, served("sales.submitCommand@1", { status: "lost", value: {} }))
        expect(await commandSalesClose(TOKEN, SCOPE, CLOSE_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "ECHOED_IDENTITY_MISMATCH",
        })
        answerWith(200, served("sales.close@1", { status: "lost", value: {} }))
        expect(
            await commandSalesClose(TOKEN, SCOPE, { ...CLOSE_REQUEST, intentId: "another-intent" }, "another-intent"),
        ).toMatchObject({ ok: false, code: "ECHOED_IDENTITY_MISMATCH" })
    })

    it("sends nothing at all without an access token", async () => {
        expect(await readSalesPolicy(null, SCOPE, POLICY_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "UNAUTHENTICATED",
            requestId: null,
        })
        expect(await commandSalesClose("", SCOPE, CLOSE_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "UNAUTHENTICATED",
            requestId: null,
        })
        expect(salesSpec.fetchMock).not.toHaveBeenCalled()
    })

    it("refuses an operation identity the route itself would reject, before any request", async () => {
        expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, "")).toMatchObject({
            ok: false,
            code: "BAD_REQUEST",
        })
        expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, "x".repeat(513))).toMatchObject({
            ok: false,
            code: "BAD_REQUEST",
        })
        expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, "control\u007fbyte")).toMatchObject({
            ok: false,
            code: "BAD_REQUEST",
        })
        expect(salesSpec.fetchMock).not.toHaveBeenCalled()
    })

    it("reports a refused bearer token as UNAUTHENTICATED rather than as a served answer", async () => {
        answerWith(401, { kind: "UNAUTHENTICATED" })
        expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "UNAUTHENTICATED",
            requestId: INTENT,
        })
    })

    it("fails closed when the transport or the body is not an answer at all", async () => {
        salesSpec.fetchMock.mockRejectedValueOnce(new Error("socket closed"))
        expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "UNREACHABLE",
        })
        salesSpec.fetchMock.mockRejectedValueOnce("not an error")
        expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "UNREACHABLE",
            reason: expect.stringContaining("network"),
        })
        salesSpec.fetchMock.mockResolvedValueOnce({
            status: 200,
            json: async () => {
                throw new Error("not json")
            },
        })
        expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
        answerWith(200, "not an envelope")
        expect(await readSalesAction(TOKEN, SCOPE, ACTION_REQUEST, INTENT)).toMatchObject({
            ok: false,
            code: "MALFORMED_ANSWER",
        })
    })

})
