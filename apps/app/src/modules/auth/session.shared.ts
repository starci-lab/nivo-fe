import type { AuthPayload, SignOutScope } from "../api/__generated__/core"

import { createContext } from "react"

/** Whether anybody is signed in, and whether that answer is settled yet. */
export type SessionState =
    /** The refresh cookie is being traded for a token; nobody knows yet. */
    | {
          readonly status: "restoring"
      }
    /** No credential, and that is settled. */
    | {
          readonly status: "anonymous"
      }
    /** A live access token, held only in memory. */
    | {
          readonly status: "signed-in"
          readonly accessToken: string
      }

/**
 * What ending a session actually observed, told apart the way the ending contract demands.
 *
 * `signOut` answers a completed request and states its two remote answers beside it: whether the
 * provider confirmed revoking this browser's refresh lineage, and - for an everywhere scope - whether
 * the identity authority confirmed ending its side. Reading a completed request as "revoked
 * remotely" would describe a revocation nobody saw, so `remoteRevocation` is `observed` only when
 * the envelope says so.
 *
 * A THIS-BROWSER SIGN-OUT CLAIMS NOTHING PRINCIPAL-WIDE, so its authority answer is `notAsked`: the
 * identity authority was never asked anything. An everywhere scope that WAS asked and stayed silent
 * is `unconfirmed` - never `confirmed`, and never `notAsked`, which would deny that the ask was
 * made. A request that never answered observed nothing, so each answer keeps its unobserved value
 * rather than being inferred from the failure.
 */
export type SessionEndReport = {
    /** Local access state and the browser's refresh custody are gone either way. */
    readonly localCleared: true
    /** Whether provider revocation was observed; never inflated from a merely completed request. */
    readonly remoteRevocation: "observed" | "unknown"
    /** Whether the identity authority confirmed ending its side of an everywhere scope. */
    readonly authorityEnding: "confirmed" | "unconfirmed" | "notAsked"
}

type AuthorityEnding = SessionEndReport["authorityEnding"]

/**
 * Read the envelope's authority flag into the report's answer.
 *
 * @param confirmed - What the sign-out envelope stated: null when no everywhere scope was asked.
 * @returns The report's authority-side answer.
 */
export const authorityEndingFrom = (confirmed: boolean | null): AuthorityEnding => {
    if (confirmed === null) {
        return "notAsked"
    }
    return confirmed ? "confirmed" : "unconfirmed"
}

/** What a caller may do with the session. */
export type Session = {
    /** The current state. */
    readonly state: SessionState
    /** Adopt the payload an auth mutation just returned. Ignores a payload still owing a factor. */
    readonly adopt: (payload: AuthPayload) => void
    /**
     * Drop the session here and on the server, and report what the server actually confirmed.
     *
     * @param scope - `everywhere` asks to end every current session of this principal and keeps this
     *                browser's custody until that answer arrives; omitted (or this browser alone)
     *                clears the local state first. Either way the local state is always cleared.
     */
    readonly end: (scope?: SignOutScope) => Promise<SessionEndReport>
    /**
     * Drop this browser's claim of a session the server has already refused.
     *
     * No sign-out request is owed: the refusal WAS the answer, so asking the server to end a
     * session it just denied would only fail again. Local custody, the in-memory token and any
     * restore still in flight end exactly as a this-browser ending ends them, and the anonymous
     * state the console redirects on is what remains.
     */
    readonly discard: () => void
}

/** The slot the provider publishes and the `useSession` door reads; null says no provider is above. */
export const SessionContext = createContext<Session | null>(null)
