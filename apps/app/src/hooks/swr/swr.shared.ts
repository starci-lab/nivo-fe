export * from "@/modules/swr/query-keys"
export * from "@/modules/swr/mutation-keys"
import type { NivoQueryKey } from "@/modules/swr/query-key-types"
export type { NivoQueryKey } from "@/modules/swr/query-key-types"

/** The cache key used by every signed-in Nivo query. */
export type NivoViewerQueryKey = readonly ["NIVO_QUERY", viewerKey: string, ...queryKey: NivoQueryKey]

const tokenHash = (value: string): string => {
    let hash = 2166136261
    for (const character of value) {
        hash ^= character.codePointAt(0) ?? 0
        hash = Math.imul(hash, 16777619)
    }
    return `opaque-${(hash >>> 0).toString(36)}`
}
const decodeJwtSubject = (accessToken: string): string | null => {
    const payload = accessToken.split(".")[1]
    if (payload === undefined) return null
    try {
        const normalised = payload.replaceAll("-", "+").replaceAll("_", "/")
        const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, "=")
        const decoded: unknown = JSON.parse(globalThis.atob(padded))
        if (typeof decoded !== "object" || decoded === null || !("sub" in decoded)) return null
        const { sub } = decoded
        return typeof sub === "string" && sub.length > 0 ? sub : null
    } catch {
        return null
    }
}

/**
 * Produce a viewer-scoped cache identity without ever placing the bearer token in SWR's key.
 * Normal JWT rotation remains on the stable `sub`; malformed local-test tokens get only a
 * one-way process-local fingerprint, so they cannot leak through devtools cache inspection.
 */
export const viewerCacheKeyFor = (accessToken: string): string =>
    decodeJwtSubject(accessToken) ?? tokenHash(accessToken)

/** Build the inspectable cache key without ever retaining the bearer credential itself. */
export const nivoViewerQueryKeyFor = (accessToken: string, queryKey: NivoQueryKey): NivoViewerQueryKey => [
    "NIVO_QUERY",
    viewerCacheKeyFor(accessToken),
    ...queryKey,
]
