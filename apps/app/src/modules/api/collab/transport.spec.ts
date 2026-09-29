import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
    COLLAB_GATEWAY_COMMAND_FIELD,
    COLLAB_GATEWAY_READ_FIELD,
    collabGatewayTransport,
    type CollabGatewayReply,
    type CollabGatewayRequest,
} from "./index"
describe("collabGatewayTransport", () => {
    const fetchStub = vi.fn()
    beforeEach(() => {
        fetchStub.mockReset()
        vi.stubGlobal("fetch", fetchStub)
    })
    afterEach(() => vi.unstubAllGlobals())

    const okEnvelope = (field: string, outcome: CollabGatewayReply) =>
        new Response(JSON.stringify({ data: { [field]: outcome } }), {
            status: 200,
            headers: { "content-type": "application/json" },
        })

    const requestBody = () =>
        JSON.parse(fetchStub.mock.calls.at(-1)?.[1]?.body as string) as {
            query: string
            variables: { request: CollabGatewayRequest }
        }

    it("posts reads on the query field and commands on the mutation field", async () => {
        fetchStub.mockResolvedValue(
            okEnvelope(COLLAB_GATEWAY_READ_FIELD, {
                ok: true,
                op: "readGroup",
                result: { op: "readGroup", page: { messages: [] } },
            }),
        )
        await collabGatewayTransport({
            accessToken: "tok",
            request: { workspaceId: "ws-1", op: "readGroup", input: {} },
        })
        const readBody = requestBody()
        expect(readBody.query).toContain(`query CollabGateway`)
        expect(readBody.query).toContain(`${COLLAB_GATEWAY_READ_FIELD}(request: $request)`)
        expect(readBody.variables.request).toEqual({ workspaceId: "ws-1", op: "readGroup", input: {} })

        fetchStub.mockResolvedValue(
            okEnvelope(COLLAB_GATEWAY_COMMAND_FIELD, {
                ok: true,
                op: "pressApprovalButton",
                result: { op: "pressApprovalButton", press: { outcome: "decided" } },
            }),
        )
        await collabGatewayTransport({
            accessToken: "tok",
            request: {
                workspaceId: "ws-1",
                op: "pressApprovalButton",
                input: { approvalId: "a-1", button: "approve" },
            },
        })
        const commandBody = requestBody()
        expect(commandBody.query).toContain(`mutation CollabGateway`)
        expect(commandBody.query).toContain(`${COLLAB_GATEWAY_COMMAND_FIELD}(request: $request)`)
    })

    it("sends the bearer credential and credentials include on every call", async () => {
        fetchStub.mockResolvedValue(
            okEnvelope(COLLAB_GATEWAY_READ_FIELD, {
                ok: true,
                op: "openOffice",
                result: { op: "openOffice", office: {} },
            }),
        )
        await collabGatewayTransport({
            accessToken: "tok-1",
            request: { workspaceId: "ws-1", op: "openOffice", input: {} },
        })
        const init = fetchStub.mock.calls[0]![1] as RequestInit
        expect(init.credentials).toBe("include")
        expect((init.headers as Record<string, string>).authorization).toBe("Bearer tok-1")
    })

    it("returns the gateway's typed outcome untouched", async () => {
        const outcome: CollabGatewayReply = {
            ok: false,
            failure: { op: "readTask", kind: "denied", reason: "membership", retryable: false },
        }
        fetchStub.mockResolvedValue(okEnvelope(COLLAB_GATEWAY_READ_FIELD, outcome))
        const answer = await collabGatewayTransport({
            accessToken: "tok",
            request: { workspaceId: "ws-1", op: "readTask", input: { taskId: "t-1" } },
        })
        expect(answer).toMatchObject({
            ok: false,
            kind: "forbidden",
            code: "COLLAB_DENIED",
            reason: "membership",
            retryable: false,
        })
    })

    it("maps http refusals, graphql errors, malformed bodies and dead networks to retryable-or-denied failures", async () => {
        fetchStub.mockResolvedValue(new Response("nope", { status: 403 }))
        const forbidden = await collabGatewayTransport({
            accessToken: "tok",
            request: { workspaceId: "ws-1", op: "openOffice", input: {} },
        })
        expect(forbidden).toMatchObject({ ok: false, kind: "forbidden", status: 403, retryable: false })

        fetchStub.mockResolvedValue(
            new Response(JSON.stringify({ errors: [{ message: "bad document" }] }), { status: 200 }),
        )
        const gqlError = await collabGatewayTransport({
            accessToken: "tok",
            request: { workspaceId: "ws-1", op: "openOffice", input: {} },
        })
        expect(gqlError).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "GRAPHQL",
            reason: "bad document",
            retryable: true,
        })

        fetchStub.mockResolvedValue(new Response("not json", { status: 200 }))
        const malformed = await collabGatewayTransport({
            accessToken: "tok",
            request: { workspaceId: "ws-1", op: "openOffice", input: {} },
        })
        expect(malformed).toMatchObject({ ok: false, kind: "unavailable", code: "MALFORMED", retryable: true })

        fetchStub.mockRejectedValue(new Error("offline"))
        const network = await collabGatewayTransport({
            accessToken: "tok",
            request: { workspaceId: "ws-1", op: "openOffice", input: {} },
        })
        expect(network).toMatchObject({ ok: false, kind: "unavailable", code: "NETWORK", retryable: true })
    })

    it("refuses a payload that is not the boundary's outcome shape", async () => {
        fetchStub.mockResolvedValue(
            new Response(JSON.stringify({ data: { [COLLAB_GATEWAY_READ_FIELD]: { unexpected: true } } }), {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        )
        const answer = await collabGatewayTransport({
            accessToken: "tok",
            request: { workspaceId: "ws-1", op: "openOffice", input: {} },
        })
        expect(answer).toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "COLLAB_UNKNOWN",
            reason: "malformed",
            retryable: true,
        })
    })
})
