"use client"

import { useCallback, useRef, useState } from "react"
import {
    forgotPasswordInit,
    forgotPasswordResend,
    forgotPasswordVerifyOtp,
    signInInit,
    signInResend,
    signInVerifyOtp,
    signUpInit,
    signUpResend,
    signUpVerifyOtp,
} from "@/modules/api/mutations/auth"
import type { AuthCode, AuthDetails, AuthMode } from "@/components/blocks/auth/AuthenticationPanel/component"

/**
 * The auth machine behind `AuthenticationPanel`.
 *
 * PORTED FROM starci-academy-fe's `useAuthPanel`, whose shape this keeps: three
 * modes, three steps, one run counter, and a panel that never learns which host
 * it is inside. What changed is only where the calls go -- see
 * `modules/api/mutations/auth.ts` for the three ways nivo's API differs from
 * the one that hook was written against.
 *
 * THE STEP IS THE STATE. `details`, `code` and `done` each draw a different
 * tree, so they are a discriminated union rather than a boolean pair; a panel
 * that tried to be "on the code step AND showing details" is a state that
 * cannot be constructed here.
 *
 * WHY A RUN COUNTER. Every request can be outrun by the reader: they submit,
 * wait, hit resend, then the first response lands. Each run takes a ticket and
 * only the current ticket may write, so a stale reply cannot move the panel
 * backwards or clear a message it never caused.
 */

/** Where the reader is in a journey. */
export type AuthStep = "details" | "code" | "done"

/** Params for {@link useAuthPanel}. */
export interface UseAuthPanelParams {
    /** Which lane to open on. */
    readonly initialMode?: AuthMode
    /** What to do once a session exists. The route redirects; the overlay closes. */
    readonly onSignedIn?: (accessToken: string) => void
}

/** What the panel's host reads and drives. */
export interface AuthPanelState {
    /** Which lane. */
    readonly mode: AuthMode
    /** Which step. */
    readonly step: AuthStep
    /** True while a request is in flight. */
    readonly isPending: boolean
    /** The last sentence worth showing, or "". */
    readonly message: string
    /** Whether that sentence is a refusal. */
    readonly isError: boolean
    /** Seconds the current code remains valid, or 0 before one is issued. */
    readonly expiresInSeconds: number
    /** Submit the first step. */
    readonly submitDetails: (details: AuthDetails) => void
    /** Submit the code. */
    readonly submitCode: (code: AuthCode) => void
    /** Ask for a new code. */
    readonly resend: () => void
    /** Switch lane, discarding the journey in progress. */
    readonly changeMode: (mode: AuthMode) => void
}

/** Everything the machine remembers. */
interface AuthPanelRecord {
    mode: AuthMode
    step: AuthStep
    isPending: boolean
    message: string
    isError: boolean
    challengeId: string
    expiresInSeconds: number
    /**
     * Held only on the forgot-password lane, and only between the two steps.
     *
     * nivo takes the new password at VERIFY rather than at init, so the panel
     * is the thing that has to carry it across the reader's trip to their
     * inbox. It never reaches the challenge store, which is the point of the
     * backend taking it late.
     */
    pendingPassword: string
}

/** The state a fresh panel starts in. */
const INITIAL: AuthPanelRecord = {
    mode: "signIn",
    step: "details",
    isPending: false,
    message: "",
    isError: false,
    challengeId: "",
    expiresInSeconds: 0,
    pendingPassword: "",
}

/**
 * Runs the three journeys.
 *
 * @param params - {@link UseAuthPanelParams}
 * @returns {@link AuthPanelState}
 */
export const useAuthPanel = (
    { initialMode = "signIn", onSignedIn }: UseAuthPanelParams = {},
): AuthPanelState => {
    const [record, setRecord] = useState<AuthPanelRecord>(() => ({ ...INITIAL, mode: initialMode }))

    /* read inside callbacks without making them depend on every field */
    const recordRef = useRef(record)
    recordRef.current = record

    const signedInRef = useRef(onSignedIn)
    signedInRef.current = onSignedIn

    /** The ticket dispenser. Only the newest run may write. */
    const runRef = useRef(0)

    const settle = useCallback((runId: number, next: Partial<AuthPanelRecord>) => {
        // a reply from an outrun request describes a panel the reader has
        // already left, so it is dropped rather than merged
        if (runId !== runRef.current) {
            return
        }
        setRecord((current) => ({ ...current, ...next, isPending: false }))
    }, [])

    const begin = useCallback((): number => {
        const runId = runRef.current + 1
        runRef.current = runId
        setRecord((current) => ({ ...current, isPending: true, message: "", isError: false }))
        return runId
    }, [])

    const submitDetails = useCallback(({ email, password }: AuthDetails) => {
        const { mode } = recordRef.current
        const runId = begin()
        if (mode === "forgotPassword") {
            // the only lane whose first step always produces a challenge: a
            // reset with no code to prove the address is not a reset
            void forgotPasswordInit(email).then((result) => {
                if (!result.ok) {
                    settle(runId, { isError: true, message: result.message })
                    return
                }
                settle(runId, {
                    step: "code",
                    challengeId: result.data.challengeId,
                    expiresInSeconds: result.data.expiresInSeconds,
                    message: result.message,
                    isError: false,
                    // nivo takes the new password at verify, so the panel carries
                    // it across the reader's trip to their inbox
                    pendingPassword: password,
                })
            })
            return
        }
        const request = mode === "signIn"
            ? signInInit({ email, password })
            : signUpInit({ email, password })
        void request.then((result) => {
            if (!result.ok) {
                settle(runId, { isError: true, message: result.message })
                return
            }
            // An academy that does not verify email answers step one with the
            // session itself. Branching here rather than asking a config
            // endpoint keeps the client honest about a setting it cannot see:
            // whatever came back IS what this academy does.
            if (result.data.session) {
                settle(runId, { step: "done", message: result.message, isError: false })
                signedInRef.current?.(result.data.session.accessToken)
                return
            }
            if (!result.data.challenge) {
                // neither field: the server answered a shape this client does
                // not know, and guessing which half is missing would be worse
                settle(runId, { isError: true, message: result.message })
                return
            }
            settle(runId, {
                step: "code",
                challengeId: result.data.challenge.challengeId,
                expiresInSeconds: result.data.challenge.expiresInSeconds,
                message: result.message,
                isError: false,
                pendingPassword: "",
            })
        })
    }, [begin, settle])

    const submitCode = useCallback(({ otp }: AuthCode) => {
        const { mode, challengeId, pendingPassword } = recordRef.current
        const runId = begin()
        if (mode === "forgotPassword") {
            void forgotPasswordVerifyOtp({ challengeId, otp, newPassword: pendingPassword })
                .then((result) => {
                    if (!result.ok) {
                        settle(runId, { isError: true, message: result.message })
                        return
                    }
                    // no session: a reset ends by signing in under the new
                    // password, which is the only thing that proves it worked
                    settle(runId, { step: "done", message: result.message, isError: false, pendingPassword: "" })
                })
            return
        }
        const request = mode === "signIn"
            ? signInVerifyOtp({ challengeId, otp })
            : signUpVerifyOtp({ challengeId, otp })
        void request.then((result) => {
            if (!result.ok) {
                settle(runId, { isError: true, message: result.message })
                return
            }
            settle(runId, { step: "done", message: result.message, isError: false })
            signedInRef.current?.(result.data.accessToken)
        })
    }, [begin, settle])

    const resend = useCallback(() => {
        const { mode, challengeId } = recordRef.current
        const runId = begin()
        const request = mode === "signIn"
            ? signInResend(challengeId)
            : mode === "signUp"
                ? signUpResend(challengeId)
                : forgotPasswordResend(challengeId)
        void request.then((result) => {
            if (!result.ok) {
                // the cooldown refusal lands here, and it is the one refusal
                // that is not the reader's fault -- so it stays on the code
                // step rather than unwinding the journey
                settle(runId, { isError: true, message: result.message })
                return
            }
            settle(runId, {
                expiresInSeconds: result.data.expiresInSeconds,
                message: result.message,
                isError: false,
            })
        })
    }, [begin, settle])

    const changeMode = useCallback((mode: AuthMode) => {
        // a new ticket, so a reply still in flight for the old lane cannot
        // land on this one
        runRef.current += 1
        setRecord({ ...INITIAL, mode })
    }, [])

    return {
        mode: record.mode,
        step: record.step,
        isPending: record.isPending,
        message: record.message,
        isError: record.isError,
        expiresInSeconds: record.expiresInSeconds,
        submitDetails,
        submitCode,
        resend,
        changeMode,
    }
}
