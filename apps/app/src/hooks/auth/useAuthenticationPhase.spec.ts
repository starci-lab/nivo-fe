import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useAuthenticationPhase } from "./useAuthenticationPhase"

describe("useAuthenticationPhase", () => {
    it("derives the visible step from journey facts and gives a settled notice priority", () => {
        const { result, rerender } = renderHook(({ noticeKind }) => useAuthenticationPhase({ noticeKind }), {
            initialProps: { noticeKind: null as "heldAddress" | null },
        })

        expect(result.current.phase).toBe("details")
        act(() => result.current.markCode())
        expect(result.current.phase).toBe("code")
        act(() => result.current.markTwoFactor())
        expect(result.current.phase).toBe("twoFactor")
        rerender({ noticeKind: "heldAddress" })
        expect(result.current.phase).toBe("notice")
        rerender({ noticeKind: null })
        expect(result.current.phase).toBe("twoFactor")
        act(() => result.current.resetFlow())
        expect(result.current.phase).toBe("details")
    })
})
