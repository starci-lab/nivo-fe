/**
 * Wait one interval, or stop waiting the moment the owner of the wait is gone.
 *
 * A hand-written poll that sleeps on a bare timer outlives the page that started it: the timer fires,
 * the loop resumes and it writes state into a page nobody is looking at. Every poll sleeps here
 * instead, so one abort clears the timer and ends the loop.
 *
 * @param duration - How long to wait, in milliseconds.
 * @param signal - Aborts the wait: the timer is cleared at once and nothing is left to fire later.
 * @returns True when the interval elapsed, false when the wait was abandoned.
 */
export const abortableWait = (duration: number, signal: AbortSignal): Promise<boolean> =>
    new Promise((resolve) => {
        if (signal.aborted) {
            resolve(false)
            return
        }
        const onAbort = () => {
            globalThis.clearTimeout(timer)
            resolve(false)
        }
        const timer = globalThis.setTimeout(() => {
            signal.removeEventListener("abort", onAbort)
            resolve(true)
        }, duration)
        signal.addEventListener("abort", onAbort, { once: true })
    })
