/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type SessionState =
    | { readonly status: "anonymous" }
    | { readonly status: "signed-in"; readonly accessToken: string }

const mocks = vi.hoisted(() => ({
    useSWR: vi.fn(),
    response: { value: { data: undefined as unknown, error: undefined as Error | undefined } },
    session: {
        state: { status: "signed-in", accessToken: "token-1" } as SessionState,
        discard: vi.fn(),
    },
}))

vi.mock("swr", () => ({
    default: (...args: ReadonlyArray<unknown>) => {
        mocks.useSWR(...args)
        return mocks.response.value
    },
}))
vi.mock("../auth/useAccessToken", () => ({
    useAccessToken: () => (mocks.session.state.status === "signed-in" ? mocks.session.state.accessToken : null),
}))
vi.mock("../auth/useSession", () => ({ useSession: () => mocks.session }))

import { useNivoQuery } from "./useNivoQuery"

const render = (key: Parameters<typeof useNivoQuery>[0] = ["resource", "one"]) =>
    renderHook(() => useNivoQuery(key, async () => mocks.response.value.data))

describe("useNivoQuery", () => {
    beforeEach(() => {
        mocks.useSWR.mockClear()
        mocks.session.discard.mockClear()
        mocks.session.state = { status: "signed-in", accessToken: "token-1" }
        mocks.response.value = { data: undefined, error: undefined }
    })

    it("names the signed-in viewer in its cache key and passes the response through", () => {
        const { result } = render()
        expect(mocks.useSWR).toHaveBeenCalledTimes(1)
        const [key] = mocks.useSWR.mock.calls[0] ?? []
        expect(key).toMatchObject(["NIVO_QUERY", expect.any(String), "resource", "one"])
        expect(result.current).toBe(mocks.response.value)
    })

    it("asks nothing while no session holds a token", () => {
        mocks.session.state = { status: "anonymous" }
        render()
        expect(mocks.useSWR.mock.calls[0]?.[0]).toBeNull()
    })

    it("discards the session when a settled answer refuses the credential itself", async () => {
        mocks.response.value = { data: { ok: false, kind: "refused", code: "UNAUTHENTICATED", reason: "sign in" } }
        render()
        await waitFor(() => expect(mocks.session.discard).toHaveBeenCalledTimes(1))
    })

    it("keeps the session for every failure kind that is not a credential refusal", async () => {
        mocks.response.value = { data: { ok: false, kind: "forbidden", code: "DENIED", reason: "no" } }
        render()
        await Promise.resolve()
        expect(mocks.session.discard).not.toHaveBeenCalled()

        mocks.response.value = { data: { ok: false, kind: "unavailable", code: "NETWORK", reason: "down" } }
        render()
        await Promise.resolve()
        expect(mocks.session.discard).not.toHaveBeenCalled()
    })

    it("does not re-discard once the session is already anonymous", async () => {
        mocks.session.state = { status: "anonymous" }
        mocks.response.value = { data: { ok: false, kind: "refused", code: "UNAUTHENTICATED", reason: "sign in" } }
        render()
        await Promise.resolve()
        expect(mocks.session.discard).not.toHaveBeenCalled()
    })
})
