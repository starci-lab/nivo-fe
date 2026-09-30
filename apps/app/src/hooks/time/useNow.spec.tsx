import { act, renderHook } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useNow } from "./useNow"

const Probe = () => <span>{String(useNow())}</span>

describe("useNow", () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"))
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it("answers null on the server so nothing time-dependent is decided before hydration", () => {
        expect(renderToString(<Probe />)).toContain("null")
    })

    it("answers the real instant on the client and refreshes it once a minute", () => {
        const { result } = renderHook(() => useNow())
        const first = result.current
        expect(first).toBe(new Date("2026-01-01T00:00:00.000Z").getTime())

        act(() => {
            vi.advanceTimersByTime(60_000)
        })

        expect(result.current).toBe((first ?? 0) + 60_000)
    })
})
