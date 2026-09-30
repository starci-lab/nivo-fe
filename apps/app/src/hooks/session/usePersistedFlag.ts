"use client"

import { useCallback, useSyncExternalStore } from "react"
import { readStored, writeStored } from "@/modules/browser-storage"

/*
 * A persisted flag is external state: it lives in browser storage, not in React. The `storage`
 * event keeps other tabs in step, while `flagListeners` carries same-tab writes the event never
 * fires for. `flagMemory` answers when storage refuses (private window, full quota), so the
 * control still follows the click instead of reading the failure as "never stored".
 */
const flagListeners = new Set<() => void>()
const flagMemory = new Map<string, boolean>()

const subscribeFlags = (onChange: () => void): (() => void) => {
    flagListeners.add(onChange)
    window.addEventListener("storage", onChange)
    return () => {
        flagListeners.delete(onChange)
        window.removeEventListener("storage", onChange)
    }
}

const readFlag = (key: string, fallback: boolean): boolean => {
    const value = readStored("local", key)
    if (value === "true") return true
    if (value === "false") return false
    return flagMemory.get(key) ?? fallback
}

const writeFlag = (key: string, value: boolean): void => {
    flagMemory.set(key, value)
    writeStored("local", key, String(value))
    for (const listener of flagListeners) listener()
}

/**
 * One boolean the reader chose, kept in local storage under `key`.
 *
 * The server and the first client render draw `fallback`, so hydration matches; the stored value
 * applies as soon as the client reads it, and follows writes made in other tabs.
 *
 * @param key - The storage key, a constant exported by `@/modules/browser-storage`.
 * @param fallback - The value while nothing is stored, and on the server.
 * @returns The flag and its setter.
 */
export const usePersistedFlag = (key: string, fallback: boolean): readonly [boolean, (value: boolean) => void] => {
    const value = useSyncExternalStore(
        subscribeFlags,
        () => readFlag(key, fallback),
        () => fallback,
    )
    const setValue = useCallback((next: boolean) => writeFlag(key, next), [key])
    return [value, setValue] as const
}
