import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useAuthenticationNotice } from "./useAuthenticationNotice"

describe("useAuthenticationNotice", () => {
    it("consumes an ending once and keeps its notice until the reader leaves it", async () => {
        const replace = vi.fn()
        const sessionEnding = { handedOff: true, kind: "applied" as const, rest: "returnTo=%2Foverview" }
        const { result, rerender } = renderHook(
            ({ arrival }) =>
                useAuthenticationNotice({ sessionEnding: arrival, pathname: "/authentication", router: { replace } }),
            { initialProps: { arrival: sessionEnding } },
        )

        expect(result.current.noticeKind).toBe("sessionEndingApplied")
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication?returnTo=%2Foverview"))
        rerender({ arrival: sessionEnding })
        expect(replace).toHaveBeenCalledTimes(1)
        act(() => result.current.clear())
        expect(result.current.noticeKind).toBeNull()
    })

    it("consumes an unrecognised value without announcing a notice", async () => {
        const replace = vi.fn()
        const { result } = renderHook(() =>
            useAuthenticationNotice({
                sessionEnding: { handedOff: true, kind: null, rest: "" },
                pathname: "/authentication",
                router: { replace },
            }),
        )
        await waitFor(() => expect(replace).toHaveBeenCalledWith("/authentication"))
        expect(result.current.noticeKind).toBeNull()
    })

    it("keeps an unconfirmed ending distinct from a completed report", () => {
        const { result } = renderHook(() =>
            useAuthenticationNotice({
                sessionEnding: { handedOff: true, kind: "unconfirmed", rest: "" },
                pathname: "/authentication",
                router: { replace: vi.fn() },
            }),
        )
        expect(result.current.noticeKind).toBe("sessionEndingUnconfirmed")
    })
})
