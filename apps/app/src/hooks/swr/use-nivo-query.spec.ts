/** @vitest-environment jsdom */

import { createElement, type PropsWithChildren } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { nivoViewerQueryKeyFor, useNivoQuery, viewerCacheKeyFor } from "./use-nivo-query"

const mocks = vi.hoisted(() => ({
    state: { status: "anonymous" } as
        | { readonly status: "anonymous" }
        | { readonly status: "signed-in"; readonly accessToken: string },
}))

vi.mock("@/modules/auth/session", () => ({
    useSession: () => ({ state: mocks.state }),
}))

const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false } },
    children,
)

const tokenFor = (subject: string, suffix: string) => {
    const payload = btoa(JSON.stringify({ sub: subject })).replaceAll("=", "")
    return `header.${payload}.${suffix}`
}

beforeEach(() => {
    mocks.state = { status: "anonymous" }
})

describe("viewerCacheKeyFor", () => {
    it("stays stable when one viewer rotates a JWT", () => {
        expect(viewerCacheKeyFor(tokenFor("viewer-1", "first")))
            .toBe(viewerCacheKeyFor(tokenFor("viewer-1", "second")))
    })

    it("changes between viewers and never exposes the token in the query key", () => {
        const firstToken = tokenFor("viewer-1", "secret")
        const secondToken = tokenFor("viewer-2", "secret")
        const first = nivoViewerQueryKeyFor(firstToken, ["wallet"])
        const second = nivoViewerQueryKeyFor(secondToken, ["wallet"])
        expect(first).not.toEqual(second)
        expect(JSON.stringify(first)).not.toContain(firstToken)
    })

    it("fingerprints malformed tokens containing full Unicode code points", () => {
        expect(viewerCacheKeyFor("not-a-jwt-🤖")).toMatch(/^opaque-/u)
    })
})

describe("useNivoQuery", () => {
    it("does not request authenticated data while signed out", () => {
        const query = vi.fn().mockResolvedValue({ ok: true, data: "ready" })
        const { result } = renderHook(() => useNivoQuery(["resource"], query), { wrapper })
        expect(result.current.data).toBeUndefined()
        expect(query).not.toHaveBeenCalled()
    })

    it("keeps an operation refusal as settled data", async () => {
        mocks.state = { status: "signed-in", accessToken: tokenFor("viewer-1", "one") }
        const refusal = { ok: false as const, reason: "forbidden", code: "FORBIDDEN" }
        const { result } = renderHook(
            () => useNivoQuery(["resource", "one"], vi.fn().mockResolvedValue(refusal)),
            { wrapper },
        )
        await waitFor(() => expect(result.current.data).toEqual(refusal))
        expect(result.current.error).toBeUndefined()
    })

    it("surfaces an unexpected transport throw separately from operation data", async () => {
        mocks.state = { status: "signed-in", accessToken: tokenFor("viewer-1", "one") }
        const { result } = renderHook(
            () => useNivoQuery(["resource", "two"], vi.fn().mockRejectedValue(new Error("offline"))),
            { wrapper },
        )
        await waitFor(() => expect(result.current.error).toEqual(new Error("offline")))
        expect(result.current.data).toBeUndefined()
    })
})