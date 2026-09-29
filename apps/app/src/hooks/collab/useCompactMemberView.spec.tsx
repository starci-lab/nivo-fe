import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { matchMediaFixture } from "../../test-support/mock-result"
import { useCompactMemberView } from "./useCompactMemberView"

const world = { compact: true }

beforeEach(() => {
    world.compact = true
    window.matchMedia = matchMediaFixture(() => world.compact)
})

describe("useCompactMemberView", () => {
    it("opens and closes the member sheet while compact and ready", () => {
        const { result } = renderHook(() => useCompactMemberView(true))
        expect(result.current.isCompactMembers).toBe(true)
        expect(result.current.isRailOpen).toBe(false)
        act(() => result.current.changeRailOpen(true))
        expect(result.current.isRailOpen).toBe(true)
        act(() => result.current.changeRailOpen(false))
        expect(result.current.isRailOpen).toBe(false)
    })

    it("never opens the sheet at desktop width", () => {
        world.compact = false
        const { result } = renderHook(() => useCompactMemberView(true))
        expect(result.current.isCompactMembers).toBe(false)
        act(() => result.current.changeRailOpen(true))
        expect(result.current.isRailOpen).toBe(false)
    })

    it("closes the sheet when the surface leaves ready and does not reopen it", () => {
        const { result, rerender } = renderHook((ready: boolean) => useCompactMemberView(ready), {
            initialProps: true,
        })
        act(() => result.current.changeRailOpen(true))
        expect(result.current.isRailOpen).toBe(true)
        rerender(false)
        expect(result.current.isRailOpen).toBe(false)
        rerender(true)
        expect(result.current.isRailOpen).toBe(false)
    })

    it("closes the sheet when the viewport leaves compact and does not reopen it", () => {
        const { result, rerender } = renderHook(() => useCompactMemberView(true))
        act(() => result.current.changeRailOpen(true))
        expect(result.current.isRailOpen).toBe(true)
        world.compact = false
        rerender()
        expect(result.current.isRailOpen).toBe(false)
        world.compact = true
        rerender()
        expect(result.current.isRailOpen).toBe(false)
    })
})
