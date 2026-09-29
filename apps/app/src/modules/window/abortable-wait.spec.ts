import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { abortableWait } from "./abortable-wait"

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe("abortableWait", () => {
    it("resolves true once the interval has elapsed", async () => {
        const controller = new AbortController()
        const waited = abortableWait(1000, controller.signal)
        await vi.advanceTimersByTimeAsync(999)
        let settled = false
        void waited.then(() => { settled = true })
        await vi.advanceTimersByTimeAsync(0)
        expect(settled).toBe(false)
        await vi.advanceTimersByTimeAsync(1)
        expect(await waited).toBe(true)
    })

    it("resolves false at once when aborted, and leaves no timer behind", async () => {
        const controller = new AbortController()
        const waited = abortableWait(1000, controller.signal)
        controller.abort()
        expect(await waited).toBe(false)
        expect(vi.getTimerCount()).toBe(0)
    })

    it("does not start waiting on a signal that is already aborted", async () => {
        const controller = new AbortController()
        controller.abort()
        expect(await abortableWait(1000, controller.signal)).toBe(false)
        expect(vi.getTimerCount()).toBe(0)
    })

    it("stops listening once the interval has elapsed", async () => {
        const controller = new AbortController()
        const remove = vi.spyOn(controller.signal, "removeEventListener")
        const waited = abortableWait(10, controller.signal)
        await vi.advanceTimersByTimeAsync(10)
        await waited
        expect(remove).toHaveBeenCalledWith("abort", expect.any(Function))
    })
})
