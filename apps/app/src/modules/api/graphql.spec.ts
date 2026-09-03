import { beforeEach, describe, expect, it, vi } from "vitest"
import { graphql, nivoQueryData, useAccessTokenFrom, useLocaleFrom } from "./graphql"

describe("nivoQueryData", () => {
    it("preserves loading, accepted data and refusal as distinct states", () => {
        expect(nivoQueryData(undefined)).toBeUndefined()
        expect(nivoQueryData({ ok: true, data: { id: "one" } })).toEqual({ id: "one" })
        expect(nivoQueryData({ ok: false })).toBeNull()
    })
})

describe("console graphql transport", () => {
    beforeEach(() => {
        vi.unstubAllGlobals()
        useAccessTokenFrom(() => null)
        useLocaleFrom(() => "vi")
        vi.restoreAllMocks()
    })

    it("sends credentials, locale, token and variables", async () => {
        useAccessTokenFrom(() => "access-1")
        useLocaleFrom(() => "en")
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            data: { operation: { success: true, data: { id: "row-1" }, message: "ok" } },
        }), { status: 200, headers: { "content-type": "application/json" } }))
        vi.stubGlobal("fetch", fetchMock)

        await expect(graphql("query Operation($id: ID!) { operation(id: $id) }", { id: "row-1" }))
            .resolves.toEqual({ ok: true, data: { id: "row-1" } })
        expect(fetchMock).toHaveBeenCalledWith("http://localhost:3068/graphql", expect.objectContaining({
            credentials: "include",
            headers: expect.objectContaining({ authorization: "Bearer access-1", "accept-language": "en" }),
            body: JSON.stringify({ query: "query Operation($id: ID!) { operation(id: $id) }", variables: { id: "row-1" } }),
        }))
    })

    it("returns network failures without throwing", async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error("offline"))
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Broken")).resolves.toMatchObject({ ok: false, code: "NETWORK" })
    })

    it("returns malformed responses without throwing", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("not-json"))
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Broken")).resolves.toMatchObject({ ok: false, code: "MALFORMED" })
    })

    it("distinguishes GraphQL, empty and application refusals", async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal("fetch", fetchMock)
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ errors: [{ message: "bad document" }] })))
        await expect(graphql("query Broken")).resolves.toEqual({ ok: false, reason: "bad document", code: "GRAPHQL" })
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: {} })))
        await expect(graphql("query Empty")).resolves.toEqual({ ok: false, reason: "empty", code: "EMPTY" })
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
            data: { operation: { success: false, data: null, message: "denied", error: "FORBIDDEN" } },
        })))
        await expect(graphql("query Refused")).resolves.toEqual({ ok: false, reason: "denied", code: "FORBIDDEN" })
    })
})