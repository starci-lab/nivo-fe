import { beforeEach, describe, expect, it, vi } from "vitest"
import { graphql } from "./graphql"

describe("expert graphql transport", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
    })

    it("posts variables and merges caller fetch options", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
            data: { courses: { success: true, data: [{ id: "course-1" }], message: "ok" } },
        }), { status: 200 }))
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Courses", { limit: 10 }, { next: { revalidate: 60 } }))
            .resolves.toEqual({ ok: true, data: [{ id: "course-1" }] })
        expect(fetchMock).toHaveBeenCalledWith("http://localhost:4068/graphql", expect.objectContaining({
            method: "POST",
            next: { revalidate: 60 },
            body: JSON.stringify({ query: "query Courses", variables: { limit: 10 } }),
        }))
    })

    it("returns network failures", async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error("offline"))
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Broken")).resolves.toEqual({ ok: false, reason: "offline" })
    })

    it("returns HTTP failures", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 503 }))
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Broken")).resolves.toEqual({ ok: false, reason: "HTTP 503" })
    })

    it("returns non-JSON failures", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("nope", { status: 200 }))
        vi.stubGlobal("fetch", fetchMock)
        await expect(graphql("query Broken")).resolves.toEqual({ ok: false, reason: "response was not JSON" })
    })

    it("returns GraphQL, empty and envelope failures", async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal("fetch", fetchMock)
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ errors: [{ message: "invalid" }] })))
        await expect(graphql("query Broken")).resolves.toEqual({ ok: false, reason: "invalid" })
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ data: {} })))
        await expect(graphql("query Empty")).resolves.toEqual({ ok: false, reason: "empty response" })
        fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
            data: { operation: { success: false, data: null, message: "denied", error: "NO_ACCESS" } },
        })))
        await expect(graphql("query Refused")).resolves.toEqual({ ok: false, reason: "NO_ACCESS" })
    })
})
