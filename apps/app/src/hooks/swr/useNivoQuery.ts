"use client"

import { useEffect } from "react"
import useSWR, { type SWRConfiguration, type SWRResponse } from "swr"
import { useAccessToken } from "../auth/useAccessToken"
import { useSession } from "../auth/useSession"

/** A product query key before the signed-in viewer identity is attached. */
export type NivoQueryKey = readonly [name: string, ...parts: ReadonlyArray<string | number | boolean | null>]

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

/** One settled answer that says the credential itself was refused: the session's claim is over. */
const isRefusedAnswer = (value: unknown): boolean =>
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === false &&
    "kind" in value &&
    value.kind === "refused"

/**
 * Own one authenticated server read. Components receive the transport's explicit `Outcome<T>` and
 * therefore keep operation refusal distinct from loading and from an unexpected thrown failure.
 *
 * A `refused` answer is the server declining the session itself: the session is discarded here, so
 * every read stops at once and the console's own anonymous redirect walks the reader to sign-in.
 * The answer still reaches its caller, which draws the refused kind like any other.
 */
export const useNivoQuery = <TAnswer>(
    queryKey: NivoQueryKey | null,
    query: () => Promise<TAnswer>,
    config?: SWRConfiguration<TAnswer, Error>,
): SWRResponse<TAnswer, Error> => {
    const accessToken = useAccessToken()
    const session = useSession()
    const key: NivoViewerQueryKey | null =
        accessToken !== null && accessToken.length > 0 && queryKey !== null ? nivoViewerQueryKeyFor(accessToken, queryKey) : null
    const response = useSWR<TAnswer, Error>(key, query, {
        revalidateOnFocus: true,
        ...config,
    })
    const answer = response.data
    useEffect(() => {
        if (session.state.status === "signed-in" && isRefusedAnswer(answer)) session.discard()
    }, [answer, session])
    return response
}
