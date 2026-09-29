import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    graphql, graphqlEnvelope, setAccessTokenReader, setLocaleReader,
    type EnvelopeAnswer, type EnvelopeShell,
} from "./graphql"

const parseRow = (input: unknown): { readonly id: string } | null =>
    typeof input === "object" && input !== null && "id" in input && typeof input.id === "string"
        ? { id: input.id }
        : null

const parseCount = (input: unknown): number | null => (typeof input === "number" ? input : null)

/** The two answers the sign-out envelope states beside its payload. */
interface SignOutOutcome {
    readonly remoteRevocationObserved: boolean
    readonly authorityEndingConfirmed: boolean | null
}

const parseSignOutAnswer = (shell: EnvelopeShell): EnvelopeAnswer<boolean, SignOutOutcome> | null => {
    const revocation: unknown = shell.siblings.remoteRevocationObserved
    const authority: unknown = shell.siblings.authorityEndingConfirmed
    if (typeof shell.data !== "boolean" || typeof revocation !== "boolean") return null
    if (authority !== null && typeof authority !== "boolean") return null
    return {
        data: shell.data,
        error: shell.error,
        message: shell.message,
        success: shell.success,
        remoteRevocationObserved: revocation,
        authorityEndingConfirmed: authority,
    }
}

describe("graphql", () => {
    beforeEach(() => {
        vi.unstubAllGlobals()
        setAccessTokenReader(() => null)
        setLocaleReader(() => "vi")
        vi.restoreAllMocks()
    })

    it("sends credentials, locale, token and variables", async () => {
        setAccessTokenReader(() => "access-1")
        setLocaleReader(() => "en")
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    data: { operation: { success: true, data: { id: "row-1" }, message: "ok" } },
                }),
                { status: 200, headers: { "content-type": "application/json" } },
            ),
        )
        vi.stubGlobal("fetch", fetchMock)

        await expect(
            graphql("query Operation($id: ID!) { operation(id: $id) }", parseRow, { id: "row-1" }),
        ).resolves.toEqual({
            ok: true,
            data: { id: "row-1" },
        })
        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost:3068/graphql",
            expect.objectContaining({
                credentials: "include",
                headers: expect.objectContaining({ authorization: "Bearer access-1", "accept-language": "en" }),
                body: JSON.stringify({
                    query: "query Operation($id: ID!) { operation(id: $id) }",
                    variables: { id: "row-1" },
                }),
            }),
        )
    })

    it("returns network failures without throwing", async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error("offline"))
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Broken", parseRow)).resolves.toMatchObject({ ok: false, code: "NETWORK" })
    })

    it("returns malformed responses without throwing", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("not-json"))
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Broken", parseRow)).resolves.toMatchObject({ ok: false, code: "MALFORMED" })
    })

    it("returns a successful payload its document parser rejects as unavailable", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ data: { operation: { success: true, data: { bad: 1 } } } })),
        )
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Weird", parseRow)).resolves.toMatchObject({
            ok: false,
            code: "MALFORMED",
            kind: "unavailable",
        })
    })

    it("distinguishes GraphQL, empty and application refusals", async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal("fetch", fetchMock)
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ errors: [{ message: "bad document" }] })))
        await expect(graphql("query Broken", parseRow)).resolves.toMatchObject({
            ok: false,
            reason: "bad document",
            code: "GRAPHQL",
        })
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: {} })))
        await expect(graphql("query Empty", parseRow)).resolves.toMatchObject({ ok: false, reason: "empty", code: "EMPTY" })
        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    data: { operation: { success: false, data: null, message: "denied", error: "FORBIDDEN" } },
                }),
            ),
        )
        await expect(graphql("query Refused", parseRow)).resolves.toMatchObject({
            ok: false,
            reason: "denied",
            code: "FORBIDDEN",
        })
    })
})

describe("graphqlEnvelope", () => {
    beforeEach(() => {
        vi.unstubAllGlobals()
        setAccessTokenReader(() => null)
        setLocaleReader(() => "vi")
        vi.restoreAllMocks()
    })

    it("hands back the answers an operation states beside its payload", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(
                JSON.stringify({
                    data: {
                        signOut: {
                            success: true,
                            data: true,
                            message: "Signed out successfully",
                            remoteRevocationObserved: false,
                            authorityEndingConfirmed: true,
                        },
                    },
                }),
                { status: 200, headers: { "content-type": "application/json" } },
            ),
        )
        vi.stubGlobal("fetch", fetchMock)

        /*
         * The whole envelope, not only `data`: these two siblings are how a caller tells a completed
         * request apart from an observed revocation, so they must survive the trip unchanged.
         */
        await expect(
            graphqlEnvelope<boolean, SignOutOutcome>("mutation SignOut { signOut }", parseSignOutAnswer),
        ).resolves.toEqual({
            ok: true,
            data: {
                success: true,
                data: true,
                message: "Signed out successfully",
                remoteRevocationObserved: false,
                authorityEndingConfirmed: true,
            },
        })
        expect(fetchMock).toHaveBeenCalledWith(
            "http://localhost:3068/graphql",
            expect.objectContaining({
                credentials: "include",
                headers: expect.objectContaining({ "accept-language": "vi" }),
            }),
        )
    })

    it("classifies the same failures the payload-only door does", async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal("fetch", fetchMock)

        fetchMock.mockRejectedValueOnce(new Error("offline"))
        await expect(graphqlEnvelope("mutation SignOut { signOut }", parseSignOutAnswer)).resolves.toMatchObject({
            ok: false,
            code: "NETWORK",
        })

        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: {} })))
        await expect(graphqlEnvelope("mutation SignOut { signOut }", parseSignOutAnswer)).resolves.toMatchObject({
            ok: false,
            reason: "empty",
            code: "EMPTY",
        })

        fetchMock.mockResolvedValueOnce(
            new Response(
                JSON.stringify({
                    data: { signOut: { success: false, data: null, message: "refused", error: "UNAUTHENTICATED" } },
                }),
            ),
        )
        await expect(graphqlEnvelope("mutation SignOut { signOut }", parseSignOutAnswer)).resolves.toMatchObject({
            ok: false,
            reason: "refused",
            code: "UNAUTHENTICATED",
        })
    })
})
describe("graphql failure kinds", () => {
    beforeEach(() => {
        vi.unstubAllGlobals()
        setAccessTokenReader(() => null)
        setLocaleReader(() => "vi")
        vi.restoreAllMocks()
    })

    const answerOnce = (status: number, body: unknown) => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))
        vi.stubGlobal("fetch", fetchMock)
        return fetchMock
    }

    it.each([
        [401, "refused"],
        [403, "forbidden"],
        [404, "not-found"],
        [422, "invalid"],
        [503, "unavailable"],
    ] as const)("keeps HTTP %i as the %s kind rather than a bare failure", async (status, kind) => {
        answerOnce(status, { message: "nope" })
        await expect(graphql("query Q { q }", parseRow)).resolves.toMatchObject({ ok: false, kind, status })
    })

    it("reads a GraphQL error the server classified by the code it named, and an unnamed one as unavailable", async () => {
        answerOnce(200, { errors: [{ message: "Unauthorized", extensions: { code: "UNAUTHENTICATED" } }] })
        await expect(graphql("query Q { q }", parseRow)).resolves.toMatchObject({
            ok: false,
            kind: "refused",
            code: "GRAPHQL",
            reason: "Unauthorized",
        })
        answerOnce(200, { errors: [{ message: "bad document" }] })
        await expect(graphql("query Q { q }", parseRow)).resolves.toMatchObject({
            ok: false,
            kind: "unavailable",
            code: "GRAPHQL",
        })
    })

    it("classifies a refused operation by its own code and an empty success as not found", async () => {
        answerOnce(200, { data: { q: { success: false, data: null, message: "no", error: "purchaser-not-admitted" } } })
        await expect(graphql("query Q { q }", parseRow)).resolves.toMatchObject({
            ok: false,
            kind: "forbidden",
            code: "purchaser-not-admitted",
            reason: "no",
        })
        answerOnce(200, { data: { q: { success: true, data: null, message: "none", error: null } } })
        await expect(graphql("query Q { q }", parseRow)).resolves.toMatchObject({ ok: false, kind: "not-found", code: "NO_DATA" })
    })

    it("sends the credential a caller supplies instead of the bound one, and none for an empty string", async () => {
        setAccessTokenReader(() => "bound")
        const fetchMock = answerOnce(200, { data: { q: { success: true, data: 1, message: "" } } })
        await graphql("query Q { q }", parseCount, undefined, { accessToken: "own" })
        await graphql("query Q { q }", parseCount, undefined, { accessToken: "" })
        expect((fetchMock.mock.calls[0]![1] as RequestInit).headers).toMatchObject({ authorization: "Bearer own" })
        expect((fetchMock.mock.calls[1]![1] as RequestInit).headers).not.toHaveProperty("authorization")
    })

    it("stops a call whose signal aborts and reports it as aborted", async () => {
        const controller = new AbortController()
        vi.stubGlobal(
            "fetch",
            vi.fn(
                (_url: string, init: RequestInit) =>
                    new Promise((_resolve, reject) => {
                        init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))
                    }),
            ),
        )
        const pending = graphql("query Q { q }", parseRow, undefined, { signal: controller.signal })
        controller.abort()
        await expect(pending).resolves.toMatchObject({ ok: false, kind: "unavailable", code: "ABORTED" })
    })
})
