"use client"

import { useLocale } from "next-intl"
import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react"
import { refreshSession, signOut as signOutMutation, type AuthPayload, type SignOutScope } from "../api/auth"
import { setAccessTokenReader, setLocaleReader } from "../api/graphql"

/**
 * Who is signed in, for as long as this tab is open.
 *
 * THE ACCESS TOKEN LIVES IN MEMORY AND NOWHERE ELSE. Not `localStorage`, not a readable cookie: both
 * are readable by any script that reaches this page, and a token in either survives the tab that
 * earned it. What survives a reload instead is the HttpOnly refresh cookie the backend wrote, which
 * script cannot touch - so a returning reader is restored by ASKING the server, not by reading
 * storage. The cost is one round trip on first paint, and it buys a token no XSS can lift.
 *
 * THREE STATES, NOT A BOOLEAN. `restoring` is a real answer and it is not the same as `signed-out`:
 * a route that redirected on `!session` would bounce every returning reader to the sign-in screen
 * for the length of that round trip, which is the classic flash this shape exists to prevent.
 *
 * IT DRAWS NOTHING. This file holds no markup and decides no layout - it is the session, which is
 * app infrastructure rather than a component tier, and it lives under `modules/` for that reason.
 */

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

/** How far the identity authority's own ending was confirmed, or that it was never asked. */
type AuthorityEnding = SessionEndReport["authorityEnding"]

/**
 * Read the envelope's authority flag into the report's answer.
 *
 * @param confirmed - What the sign-out envelope stated: null when no everywhere scope was asked.
 * @returns The report's authority-side answer.
 */
const authorityEndingFrom = (confirmed: boolean | null): AuthorityEnding => {
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
}
/** The slot the provider publishes and the `useSession` door reads; null says no provider is above. */
export const SessionContext = createContext<Session | null>(null)

/** Props for {@link SessionProvider}. */
export type SessionProviderProps = {
    /** Everything that may read the session. */
    readonly children: ComponentProps<"div">["children"]
}

/**
 * Hold the session above every route.
 *
 * @param props - {@link SessionProviderProps}
 * @returns The provided tree.
 */
export const SessionProvider = (props: SessionProviderProps) => {
    const { children } = props
    const [state, setState] = useState<SessionState>({
        status: "restoring",
    })

    /*
     * A REF BESIDE THE STATE, because the transport reads the token during a fetch rather than during
     * a render. Reading React state from that callback would hand it whichever value was captured
     * when the reader was installed - the one that expired.
     */
    const token = useRef<string | null>(null)

    /*
     * A CUSTODY EPOCH BESIDE THE TOKEN, because a refresh answer can arrive after a newer custody
     * decision already settled. `adopt` and `end` each bump it; the restore below applies its result
     * only while the epoch is still the one it started under. A losing or late observation - a
     * refusal that was overtaken by a sign-in, or a success that was overtaken by a sign-out - must
     * never clear or overwrite the newer custody result.
     */
    const custodyEpoch = useRef(0)

    /*
     * THE TRANSPORT ASKS FOR THE LANGUAGE THE SAME WAY IT ASKS FOR THE TOKEN, and for the same
     * reason: it must not import the routing runtime. A refusal sentence comes from the API, so the
     * API has to be told which language to refuse in.
     */
    const locale = useLocale()
    /*
     * THE READERS ARE BOUND ONCE THE PROVIDER HAS MOUNTED. Installing them during render would read
     * the ref before React permits; installing them in the first effect still puts the binding in
     * place before any restore answer - and therefore before any signed-in surface - can exist.
     */
    useEffect(() => {
        setAccessTokenReader(() => token.current)
        setLocaleReader(() => locale)
    }, [locale])
    const adopt = useCallback((payload: AuthPayload) => {
        /*
         * A payload that still owes a second factor is NOT a session. Adopting it would put `null`
         * in the token and leave the app believing somebody is signed in.
         */
        if (payload.requiresTwoFactor || payload.accessToken === null) {
            return
        }
        custodyEpoch.current += 1
        token.current = payload.accessToken
        setState({
            status: "signed-in",
            accessToken: payload.accessToken,
        })
    }, [])
    const end = useCallback(async (scope?: SignOutScope): Promise<SessionEndReport> => {
        /*
         * AN EVERYWHERE ENDING WAITS FOR ITS ANSWER BEFORE DROPPING LOCAL CUSTODY. Clearing first
         * would unmount the console - and the every-browser confirmation riding it - while the request
         * is still in flight, so its pending face could never paint and the hand-off it navigates with
         * on the answer would reach a sign-in surface that already mounted without it. Keeping custody
         * until the answer arrives keeps the console and the confirmation alive through the request.
         * The clear still runs on EVERY outcome in the `finally`: a failed or thrown request drops
         * this browser's in-memory access and custody epoch exactly as a completed one does - the
         * person lands on Login either way, as sds.login.session-custody requires.
         */
        if (scope === "everywhere") {
            try {
                const answer = await signOutMutation({
                    scope,
                })
                if (!answer.ok) {
                    return {
                        localCleared: true,
                        remoteRevocation: "unknown",
                        authorityEnding: "unconfirmed",
                    }
                }
                return {
                    localCleared: true,
                    remoteRevocation: answer.data.remoteRevocationObserved ? "observed" : "unknown",
                    authorityEnding: authorityEndingFrom(answer.data.authorityEndingConfirmed),
                }
            } finally {
                custodyEpoch.current += 1
                token.current = null
                setState({
                    status: "anonymous",
                })
            }
        }
        /*
         * A THIS-BROWSER ENDING STILL CLEARS FIRST. If the network call fails the reader is still
         * signed out of this tab, which is the outcome they asked for; the alternative leaves somebody
         * staring at a console they just tried to leave. Bumping the epoch also retires any refresh
         * still in flight, so its answer cannot put a session back after this one was ended.
         */
        custodyEpoch.current += 1
        token.current = null
        setState({
            status: "anonymous",
        })
        /*
         * The mutation's `data` reports a completed request, not an observed revocation, so the report
         * is built from the answers the envelope states BESIDE `data`. A request that never answered
         * confirmed nothing: an unasked authority stays `notAsked`, an asked-but-silent one stays
         * `unconfirmed` rather than being reported as ended, and an unobserved revocation stays
         * `unknown`. Nothing here is inferred from the failure, only read from what was observed.
         */
        const answer = await signOutMutation(
            scope === undefined
                ? undefined
                : {
                      scope,
                  },
        )
        if (!answer.ok) {
            return {
                localCleared: true,
                remoteRevocation: "unknown",
                authorityEnding: "notAsked",
            }
        }
        return {
            localCleared: true,
            remoteRevocation: answer.data.remoteRevocationObserved ? "observed" : "unknown",
            authorityEnding: authorityEndingFrom(answer.data.authorityEndingConfirmed),
        }
    }, [])
    useEffect(() => {
        let cancelled = false
        const restore = async (): Promise<void> => {
            const epochAtStart = custodyEpoch.current
            const result = await refreshSession()
            if (cancelled || custodyEpoch.current !== epochAtStart) {
                return
            }
            if (result.ok && !result.data.requiresTwoFactor && result.data.accessToken !== null) {
                token.current = result.data.accessToken
                setState({
                    status: "signed-in",
                    accessToken: result.data.accessToken,
                })
                return
            }
            /*
             * EVERY OTHER OUTCOME IS ANONYMOUS, including a network failure. A reader whose refresh
             * could not be answered is not signed in, and pretending the question is still open would
             * leave the app restoring forever.
             */
            setState({
                status: "anonymous",
            })
        }
        void restore()
        return () => {
            cancelled = true
        }
    }, [])
    const value = useMemo<Session>(
        () => ({
            state,
            adopt,
            end,
        }),
        [state, adopt, end],
    )
    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
