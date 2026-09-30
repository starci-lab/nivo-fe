import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { exchangeOauthCode, takeOauthProvider } = vi.hoisted(() => ({
    exchangeOauthCode: vi.fn(),
    takeOauthProvider: vi.fn(),
}))
vi.mock("@/modules/api/auth", () => ({ exchangeOauthCode }))
vi.mock("@/modules/auth", () => ({ takeOauthProvider }))

import { useOauthReturnExchange } from "./auth"

describe("useOauthReturnExchange", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        takeOauthProvider.mockReturnValue("google")
    })
    afterEach(() => window.history.replaceState(null, "", "/"))

    it("spends the returned code once, cleans the address and answers with the exchange result", async () => {
        const answer = { ok: true, data: { kind: "accepted" } }
        exchangeOauthCode.mockResolvedValue(answer)
        window.history.replaceState(null, "", "/sign-in?code=c1&state=s1")
        const { result } = renderHook(() => useOauthReturnExchange())
        await waitFor(() => expect(result.current.answer).toBe(answer))
        expect(exchangeOauthCode).toHaveBeenCalledTimes(1)
        expect(exchangeOauthCode).toHaveBeenCalledWith({ code: "c1", provider: "google", state: "s1" })
        expect(window.location.search).toBe("")
    })

    it("cleans a refused return without exchanging anything", async () => {
        window.history.replaceState(null, "", "/sign-in?error=access_denied")
        const { result } = renderHook(() => useOauthReturnExchange())
        await waitFor(() => expect(window.location.search).toBe(""))
        expect(exchangeOauthCode).not.toHaveBeenCalled()
        expect(result.current.answer).toBeUndefined()
    })

    it("does nothing when the address carries no return", () => {
        renderHook(() => useOauthReturnExchange())
        expect(takeOauthProvider).not.toHaveBeenCalled()
        expect(exchangeOauthCode).not.toHaveBeenCalled()
    })
})
