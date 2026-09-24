import { beforeEach, describe, expect, it, vi } from "vitest"
import { graphql, graphqlEnvelope, useAccessTokenFrom, useLocaleFrom } from "./graphql"

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

/** The two answers the sign-out envelope states beside its payload. */
interface SignOutOutcome {
    readonly remoteRevocationObserved: boolean
    readonly authorityEndingConfirmed: boolean | null
}

describe("console graphql envelope transport", () => {
    beforeEach(() => {
        vi.unstubAllGlobals()
        useAccessTokenFrom(() => null)
        useLocaleFrom(() => "vi")
        vi.restoreAllMocks()
    })

    it("hands back the answers an operation states beside its payload", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            data: {
                signOut: {
                    success: true,
                    data: true,
                    message: "Signed out successfully",
                    remoteRevocationObserved: false,
                    authorityEndingConfirmed: true,
                },
            },
        }), { status: 200, headers: { "content-type": "application/json" } }))
        vi.stubGlobal("fetch", fetchMock)

        /*
         * The whole envelope, not only `data`: these two siblings are how a caller tells a completed
         * request apart from an observed revocation, so they must survive the trip unchanged.
         */
        await expect(graphqlEnvelope<boolean, SignOutOutcome>("mutation SignOut { signOut }"))
            .resolves.toEqual({
                ok: true,
                data: {
                    success: true,
                    data: true,
                    message: "Signed out successfully",
                    remoteRevocationObserved: false,
                    authorityEndingConfirmed: true,
                },
            })
        expect(fetchMock).toHaveBeenCalledWith("http://localhost:3068/graphql", expect.objectContaining({
            credentials: "include",
            headers: expect.objectContaining({ "accept-language": "vi" }),
        }))
    })

    it("classifies the same failures the payload-only door does", async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal("fetch", fetchMock)

        fetchMock.mockRejectedValueOnce(new Error("offline"))
        await expect(graphqlEnvelope("mutation SignOut { signOut }")).resolves.toMatchObject({ ok: false, code: "NETWORK" })

        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: {} })))
        await expect(graphqlEnvelope("mutation SignOut { signOut }")).resolves.toEqual({ ok: false, reason: "empty", code: "EMPTY" })

        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
            data: { signOut: { success: false, data: null, message: "refused", error: "UNAUTHENTICATED" } },
        })))
        await expect(graphqlEnvelope("mutation SignOut { signOut }")).resolves.toEqual({ ok: false, reason: "refused", code: "UNAUTHENTICATED" })
    })
})