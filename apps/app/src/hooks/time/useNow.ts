"use client"

import { useSyncExternalStore } from "react"

/** How often the shared clock ticks: a due date or an expiry never needs a finer answer. */
const TICK_MS = 60_000

const listeners = new Set<() => void>()
let instant: number | null = null
let timer: ReturnType<typeof setInterval> | undefined

const tick = () => {
    instant = Date.now()
    for (const listener of listeners) listener()
}

const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener)
    if (timer === undefined) timer = setInterval(tick, TICK_MS)
    return () => {
        listeners.delete(listener)
        if (listeners.size === 0 && timer !== undefined) {
            clearInterval(timer)
            timer = undefined
        }
    }
}

const readClient = (): number => {
    instant ??= Date.now()
    return instant
}

const readServer = (): null => null

/**
 * The current instant, as an external store instead of a read during render.
 *
 * The server and the hydrating client both answer `null`, so no time-dependent word or tone is
 * decided before hydration; the first committed render then carries the real instant, and the
 * shared clock refreshes it once a minute. A component treats `null` as "not known yet".
 *
 * @returns Milliseconds since the epoch, or `null` until the client has committed.
 */
export const useNow = (): number | null => useSyncExternalStore(subscribe, readClient, readServer)
