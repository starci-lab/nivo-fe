import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { usePersistedFlag } from "./usePersistedFlag"

const KEY = "test:persisted-flag"

describe("usePersistedFlag", () => {
    afterEach(() => {
        vi.restoreAllMocks()
        window.localStorage.clear()
    })

    it("answers the fallback while nothing is stored", () => {
        const { result } = renderHook(() => usePersistedFlag(KEY, false))
        expect(result.current[0]).toBe(false)
    })

    it("reads a stored value and writes the next one through storage", () => {
        window.localStorage.setItem(KEY, "true")
        const { result } = renderHook(() => usePersistedFlag(KEY, false))
        expect(result.current[0]).toBe(true)

        act(() => result.current[1](false))
        expect(result.current[0]).toBe(false)
        expect(window.localStorage.getItem(KEY)).toBe("false")
    })

    it("follows a write from another tab", () => {
        const { result } = renderHook(() => usePersistedFlag(KEY, false))
        act(() => {
            window.localStorage.setItem(KEY, "true")
            window.dispatchEvent(new StorageEvent("storage", { key: KEY }))
        })
        expect(result.current[0]).toBe(true)
    })

    it("keeps following the click when storage refuses", () => {
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new DOMException("Blocked", "SecurityError")
        })
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new DOMException("Blocked", "SecurityError")
        })
        const { result } = renderHook(() => usePersistedFlag("test:refused", false))

        act(() => result.current[1](true))
        expect(result.current[0]).toBe(true)
    })
})
