import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { isPrintableIdentity, isRouteErrorName, operationAddress, routeFailureKind, sendOperation } from "./operation-route"

const SCOPE = { workspaceId: "w/1", instanceId: "i 1", installationId: "n?1" }
const ADDRESS = "http://core.test/op"

let fetchMock: ReturnType<typeof vi.fn>
beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe("operationAddress", () => {
    it("percent-encodes the coordinates and writes the registered name verbatim", () => {
        expect(operationAddress(SCOPE, "sales.close@1")).toBe("http://localhost:3068/api/v1/agentos/workspaces/w%2F1/instances/i%201/installations/n%3F1/operations/sales.close@1")
    })
})

describe("isPrintableIdentity", () => {
    it("accepts bounded printable text and refuses empty, over-long and control-byte identities", () => {
        expect(isPrintableIdentity("b7b7c1f0")).toBe(true)
        expect(isPrintableIdentity("")).toBe(false)
        expect(isPrintableIdentity("a".repeat(513))).toBe(false)
        expect(isPrintableIdentity("a\nb")).toBe(false)
        expect(isPrintableIdentity("a\u007fb")).toBe(false)
    })
})

describe("routeFailureKind", () => {
    it("maps every closed route and module code to one kind, and any other code to unavailable", () => {
        expect(routeFailureKind("UNAUTHENTICATED")).toBe("refused")
        expect(routeFailureKind("REFUSED")).toBe("forbidden")
        expect(routeFailureKind("forbidden")).toBe("forbidden")
        expect(routeFailureKind("SALES_REFUSED_DENIED")).toBe("forbidden")
        expect(routeFailureKind("OPERATION_NOT_REGISTERED_FOR_INSTALLATION")).toBe("not-found")
        for (const code of ["BAD_REQUEST", "UNSUPPORTED_OPERATION_VERSION", "validation", "conflict", "SALES_REFUSED_INVALID", "SALES_REFUSED_CONFLICT"]) expect(routeFailureKind(code)).toBe("invalid")
        for (const code of ["CONTROLPLANE_UNAVAILABLE", "CURRENT_AUTHORITY_UNAVAILABLE", "DEADLINE_EXCEEDED", "outcome_unknown", "UNREACHABLE", "MALFORMED_ANSWER", "stale-authority"]) expect(routeFailureKind(code)).toBe("unavailable")
    })
})

describe("isRouteErrorName", () => {
    it("recognises exactly the closed error names of the route", () => {
        expect(isRouteErrorName("DEADLINE_EXCEEDED")).toBe(true)
        expect(isRouteErrorName("REFUSED")).toBe(true)
        expect(isRouteErrorName("sales_result")).toBe(false)
        expect(isRouteErrorName(7)).toBe(false)
    })
})

describe("sendOperation", () => {
    it("sends nothing for a bad identity or a missing token, and says why", async () => {
        expect(await sendOperation("tok", ADDRESS, "", {})).toMatchObject({ arrived: false, code: "BAD_REQUEST" })
        expect(await sendOperation(null, ADDRESS, "id", {})).toMatchObject({ arrived: false, code: "UNAUTHENTICATED", requestId: null })
        expect(await sendOperation("", ADDRESS, "id", {})).toMatchObject({ arrived: false, code: "UNAUTHENTICATED" })
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it("posts the identity and the request under the bearer token and never carries the cookie", async () => {
        fetchMock.mockResolvedValue({ status: 200, json: async () => ({ kind: "x" }) })
        expect(await sendOperation("tok", ADDRESS, "id", { a: 1 })).toEqual({ arrived: true, body: { kind: "x" } })
        const init = fetchMock.mock.calls[0][1] as RequestInit
        expect(init.credentials).toBe("omit")
        expect(init.headers).toMatchObject({ authorization: "Bearer tok" })
        expect(JSON.parse(String(init.body))).toEqual({ requestId: "id", input: { a: 1 } })
    })

    it("hands back the body of a refusal the route named, whatever its status", async () => {
        fetchMock.mockResolvedValue({ status: 503, json: async () => ({ kind: "CONTROLPLANE_UNAVAILABLE" }) })
        expect(await sendOperation("tok", ADDRESS, "id", {})).toEqual({ arrived: true, body: { kind: "CONTROLPLANE_UNAVAILABLE" } })
    })

    it("states a 401 as an unauthenticated session, a dead network as unreachable and a non-JSON reply as malformed", async () => {
        fetchMock.mockResolvedValueOnce({ status: 401, json: async () => ({}) })
        expect(await sendOperation("tok", ADDRESS, "id", {})).toMatchObject({ arrived: false, code: "UNAUTHENTICATED", requestId: "id" })
        fetchMock.mockRejectedValueOnce(new Error("offline"))
        expect(await sendOperation("tok", ADDRESS, "id", {})).toMatchObject({ arrived: false, code: "UNREACHABLE" })
        fetchMock.mockResolvedValueOnce({ status: 500, json: async () => { throw new Error("html") } })
        expect(await sendOperation("tok", ADDRESS, "id", {})).toMatchObject({ arrived: false, code: "MALFORMED_ANSWER" })
    })
})
