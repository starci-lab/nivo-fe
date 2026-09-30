import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    accessToken: "signed-token" as string | null,
    sessionState: "signed-in" as string,
    query: vi.fn(),
}))

vi.mock("@/hooks", () => ({
    useAccessToken: () => mocks.accessToken,
    useSession: () => ({ state: { status: mocks.sessionState } }),
}))
vi.mock("@/hooks/swr/useNivoQuery", () => ({
    useNivoQuery: (...args: ReadonlyArray<unknown>) => mocks.query(...args),
}))

import { usePurchaseStatusQueries } from "./usePurchaseStatusQueries"

describe("usePurchaseStatusQueries", () => {
    beforeEach(() => {
        mocks.query.mockReturnValue({ data: undefined, error: undefined, isValidating: false, mutate: vi.fn() })
    })

    it("scopes the purchase read to the signed-in session", () => {
        const { result } = renderHook(() => usePurchaseStatusQueries("purchase-1"))

        expect(mocks.query).toHaveBeenCalledWith(
            ["workspace-checkout", "status", "purchase-1"],
            expect.any(Function),
            { refreshInterval: expect.any(Function) },
        )
        expect(result.current.accessToken).toBe("signed-token")
        expect(result.current.sessionRestoring).toBe(false)
    })

    it("holds the read while anonymous and exposes session restoration", () => {
        mocks.accessToken = null
        mocks.sessionState = "restoring"
        const { result } = renderHook(() => usePurchaseStatusQueries("purchase-2"))

        expect(mocks.query).toHaveBeenCalledWith(null, expect.any(Function), { refreshInterval: expect.any(Function) })
        expect(result.current.accessToken).toBeNull()
        expect(result.current.sessionRestoring).toBe(true)
    })
})
