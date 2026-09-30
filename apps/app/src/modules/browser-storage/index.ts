/**
 * The one place the app touches `localStorage` and `sessionStorage`.
 *
 * Storage does not exist on the server, throws in private windows and when the quota is full. Every
 * call here is guarded by `typeof window` and a try/catch that settles to `null`, `false` or nothing,
 * so a caller never sees a throw and server rendering never reaches a missing global.
 */

/** Which browser storage area a key lives in. */
type StorageArea = "local" | "session"

/** Local key: whether the console navigation is collapsed. */
export const NAVIGATION_COLLAPSED_KEY = "nivo-console-navigation-collapsed"

/** Local key: whether the AgentOS Execute session rail is collapsed. */
export const EXECUTE_SESSIONS_COLLAPSED_KEY = "nivo:agentos:execute-sessions"

/** Session key: the route interrupted by authentication. */
export const RETURN_TO_STORAGE_KEY = "nivo.auth.return-to"

/** Session key: the OAuth provider chosen before leaving for the provider. */
export const OAUTH_PROVIDER_KEY = "nivo.oauth.provider"

/** Session key: the wallet top-up in flight, read again on the provider return. */
export const TOP_UP_SESSION_KEY = "nivo.wallet.top-up"

const areaOf = (area: StorageArea): Storage | null => {
    if (typeof window === "undefined") return null
    try {
        return area === "local" ? window.localStorage : window.sessionStorage
    } catch {
        return null
    }
}

/**
 * Read one stored value.
 *
 * @param area - The storage area.
 * @param key - The key to read.
 * @returns The value, or null when absent, on the server, or when storage refuses.
 */
export const readStored = (area: StorageArea, key: string): string | null => {
    try {
        return areaOf(area)?.getItem(key) ?? null
    } catch {
        return null
    }
}

/**
 * Write one value.
 *
 * @param area - The storage area.
 * @param key - The key to write.
 * @param value - The value to keep.
 * @returns Whether the value was kept; false on the server, a full quota or a private window.
 */
export const writeStored = (area: StorageArea, key: string, value: string): boolean => {
    try {
        const storage = areaOf(area)
        if (storage === null) return false
        storage.setItem(key, value)
        return true
    } catch {
        return false
    }
}

/**
 * Remove one stored value; nothing happens when storage is unavailable.
 *
 * @param area - The storage area.
 * @param key - The key to remove.
 */
export const removeStored = (area: StorageArea, key: string): void => {
    try {
        areaOf(area)?.removeItem(key)
    } catch {
        return
    }
}
