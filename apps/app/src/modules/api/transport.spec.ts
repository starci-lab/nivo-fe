import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DEFAULT_TIMEOUT_MS, send } from "./transport"

let fetchMock: ReturnType<typeof vi.fn>

const reply = (status: number, body: unknown) => ({ status, json: async () => body })
const notJson = (status: number) => ({ status, json: async () => { throw new Error("not json") } })
const request = { url: "http://core.test/x", method: "POST", credentials: "omit" } as const
const abortWhenSignalled = (_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))
})

beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe("send", () => {
    it("hands back the status and the parsed body of a 2xx answer", async () => {
        fetchMock.mockResolvedValue(reply(200, { a: 1 }))
        expect(await send(request)).toEqual({ ok: true, data: { status: 200, body: { a: 1 } } })
    })

    it("sends the credential, the language, the JSON document and the credentials mode it was told to", async () => {
        fetchMock.mockResolvedValue(reply(200, {}))
        await send({ ...request, credentials: "include", accessToken: "tok", locale: "vi", json: { q: 1 } })
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
        expect(url).toBe("http://core.test/x")
        expect(init.method).toBe("POST")
        expect(init.credentials).toBe("include")
        expect(init.headers).toEqual({ "content-type": "application/json", "accept-language": "vi", authorization: "Bearer tok" })
        expect(init.body).toBe(JSON.stringify({ q: 1 }))
    })

    it("sends no credential for a missing or empty token", async () => {
        fetchMock.mockResolvedValue(reply(200, {}))
        await send({ ...request, accessToken: "" })
        await send({ ...request, accessToken: null })
        for (const call of fetchMock.mock.calls) expect((call[1] as RequestInit).headers).toEqual({})
    })

    it("sends a raw body under the content type it was given", async () => {
        fetchMock.mockResolvedValue(reply(200, null))
        const bytes = new Blob(["abc"])
        await send({ ...request, method: "PUT", body: bytes, contentType: "application/pdf", reply: "none" })
        const init = fetchMock.mock.calls[0][1] as RequestInit
        expect(init.body).toBe(bytes)
        expect(init.headers).toEqual({ "content-type": "application/pdf" })
    })

    it("does not read the body of a reply it was told to ignore", async () => {
        fetchMock.mockResolvedValue(notJson(200))
        expect(await send({ ...request, reply: "none" })).toEqual({ ok: true, data: { status: 200, body: null } })
    })

    it.each([
        [401, "refused"],
        [403, "forbidden"],
        [404, "not-found"],
        [409, "invalid"],
        [422, "invalid"],
        [429, "unavailable"],
        [503, "unavailable"],
    ] as const)("keeps HTTP %i as the %s kind and hands back the body it carried", async (status, kind) => {
        fetchMock.mockResolvedValue(reply(status, { kind: "named" }))
        expect(await send(request)).toMatchObject({ ok: false, kind, status, code: `HTTP_${status}`, body: { kind: "named" } })
    })

    it("keeps a non-JSON failure a failure of its own status, with no body", async () => {
        fetchMock.mockResolvedValue(notJson(502))
        expect(await send(request)).toMatchObject({ ok: false, kind: "unavailable", status: 502, body: null })
    })

    it("reports a 2xx answer that is not JSON as malformed, never as an answer", async () => {
        fetchMock.mockResolvedValue(notJson(200))
        expect(await send(request)).toMatchObject({ ok: false, kind: "unavailable", code: "MALFORMED", status: 200, retryable: true })
    })

    it("reports a request that never arrived as a network failure without a status", async () => {
        fetchMock.mockRejectedValue(new Error("offline"))
        expect(await send(request)).toMatchObject({ ok: false, kind: "unavailable", code: "NETWORK", status: null, retryable: true })
    })

    it("abandons a request that outlasts its deadline", async () => {
        vi.useFakeTimers()
        fetchMock.mockImplementation(abortWhenSignalled)
        const pending = send({ ...request, timeoutMs: 50 })
        await vi.advanceTimersByTimeAsync(50)
        expect(await pending).toMatchObject({ ok: false, kind: "unavailable", code: "TIMEOUT", status: null })
    })

    it("has a default deadline", () => {
        expect(DEFAULT_TIMEOUT_MS).toBeGreaterThan(0)
    })

    it("abandons a request when the signal of the caller aborts, and says it was aborted", async () => {
        const controller = new AbortController()
        fetchMock.mockImplementation(abortWhenSignalled)
        const pending = send({ ...request, signal: controller.signal })
        controller.abort()
        expect(await pending).toMatchObject({ ok: false, kind: "unavailable", code: "ABORTED" })
    })

    it("does not let a request whose signal is already aborted through", async () => {
        const controller = new AbortController()
        controller.abort()
        fetchMock.mockImplementation((_url: string, init: RequestInit) => init.signal?.aborted === true ? Promise.reject(new DOMException("aborted", "AbortError")) : Promise.resolve(reply(200, {})))
        expect(await send({ ...request, signal: controller.signal })).toMatchObject({ ok: false, code: "ABORTED" })
    })
})
