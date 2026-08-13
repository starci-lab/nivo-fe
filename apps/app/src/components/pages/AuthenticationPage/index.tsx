"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { _AuthenticationPage } from "./component"
import type {
    AuthActions,
    AuthCode,
    AuthDetails,
    AuthMode,
    AuthenticationPanelProps,
} from "@/components/blocks/auth/AuthenticationPanel"
import {
    forgotPasswordInit,
    forgotPasswordResend,
    forgotPasswordVerifyOtp,
    signIn,
    signUpInit,
    signUpResend,
    signUpVerifyOtp,
    type OtpChallenge,
} from "@/modules/api/auth"
import { useSession } from "@/modules/auth/session"

/**
 * PAGE - `/authentication`, connected half.
 *
 * IT RESOLVES THE WORLD AND RENDERS ONLY ITS TWIN. Seven mutations, one challenge, one cooldown
 * clock and the mode live here; `_AuthenticationPage` receives finished values and draws them.
 *
 * THREE JOURNEYS, THREE SHAPES, AND THEY ARE NOT INTERCHANGEABLE:
 *
 * - signIn exchanges a password for a SESSION in one request, and can answer with a two-factor
 *   challenge instead - which is neither a refusal nor a session, so `requiresTwoFactor` is read
 *   BEFORE `accessToken` or that challenge becomes a silent failure.
 * - signUp mails a code first and only creates the account when the code comes back. An address that
 *   is already registered is refused at VERIFY, after the code is spent, because that is where
 *   `createUser` throws. Nothing here can give the code back.
 * - forgotPassword mails a code and answers a BOOLEAN at the end. Setting a password is not signing
 *   in, so nothing is adopted and the reader is sent back to sign in.
 *
 * THE RESET JOURNEY'S REFUSAL IS DELIBERATELY GENERIC. A wrong code and an address nobody has come
 * back as two different exceptions; printing them would let a caller who can read an inbox tell those
 * apart, which is the last place the question "does this person have an account" could leak.
 *
 * THE COOLDOWN IS COUNTED HERE, NOT ASKED FOR. `OTP_RESEND_COOLDOWN_MS` is sixty real seconds and the
 * backend answers `OTP_RESEND_TOO_SOON_EXCEPTION` to anything sooner. It is a LOCAL clock and may
 * drift from the server's; the refusal is still handled, because a countdown that disagrees is not a
 * reason to stop reading the answer.
 *
 * SWITCHING MODE CLEARS EVERYTHING. A challenge belongs to one address on one journey, and carrying
 * it across would offer a reader a code that cannot finish where they now are.
 */

/**
 * Which step, and in what condition, the screen is in.
 *
 * It lives HERE rather than beside the drawing half, because a phase is a fact about a journey in
 * flight - which request has answered and what it said - and the drawing half deliberately knows
 * nothing about journeys. What it receives is a panel that has already been decided.
 */
type AuthPhase = "details" | "code" | "done" | "twoFactor"

/** How long the resend refuses, in seconds. Mirrors `OTP_RESEND_COOLDOWN_MS` on the backend. */
const RESEND_COOLDOWN_SECONDS = 60

/** Seconds per minute, so the code hint states a lifetime rather than a raw count. */
const SECONDS_PER_MINUTE = 60

/**
 * The authentication screen.
 *
 * @returns The page.
 */
export const AuthenticationPage = () => {
    const t = useTranslations("authentication")
    const router = useRouter()
    const session = useSession()
    const [mode, setMode] = useState<AuthMode>("signIn")
    const [phase, setPhase] = useState<AuthPhase>("details")
    const [email, setEmail] = useState("")
    const [ttlMinutes, setTtlMinutes] = useState(0)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)
    const [statusMessage, setStatusMessage] = useState("")
    const [isError, setIsError] = useState(false)
    const [isPending, setIsPending] = useState(false)
    /*
     * THE SWITCH IS REAL STATE AND IT CHANGES NOTHING SERVER-SIDE YET. The refresh cookie is written
     * with a fixed thirty-day `maxAge` and no per-request control, so a session lasts the same length
     * either way. It is held here rather than dropped because making it mean something is one backend
     * change - the cookie taking its lifetime from this flag - and the control has to exist before
     * that change has anywhere to land.
     */
    const [isRememberMe, setIsRememberMe] = useState(true)
    // Held in a ref rather than state: nothing on screen shows it, and re-rendering to store it would
    // cost the uncontrolled fields their contents.
    const challengeId = useRef("")

    useEffect(() => {
        if (cooldownSeconds === 0) return undefined
        const timer = setTimeout(() => setCooldownSeconds((left) => left - 1), 1000)
        return () => clearTimeout(timer)
    }, [cooldownSeconds])

    /** Put the screen back to a clean first step, keeping only the journey. */
    const clear = () => {
        challengeId.current = ""
        setCooldownSeconds(0)
        setStatusMessage("")
        setIsError(false)
        setPhase("details")
    }

    /**
     * Adopt a challenge, whichever request produced it.
     *
     * @param challenge - The handle and its lifetime.
     */
    const adoptChallenge = (challenge: OtpChallenge) => {
        challengeId.current = challenge.challengeId
        setTtlMinutes(Math.max(1, Math.round(challenge.expiresInSeconds / SECONDS_PER_MINUTE)))
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS)
    }

    /**
     * Report a refusal in one place, so no branch forgets to stop the spinner.
     *
     * @param reason - The sentence to show.
     */
    const refuse = (reason: string) => {
        setIsError(true)
        setStatusMessage(reason)
    }

    /**
     * Submit the first step of whichever journey is running.
     *
     * @param details - The email, and the password on the journeys that ask for one.
     */
    const submitDetails = async (details: AuthDetails) => {
        setIsPending(true)
        setIsError(false)
        setStatusMessage("")

        if (mode === "signIn") {
            const result = await signIn(details)
            setIsPending(false)
            if (!result.ok) {
                refuse(result.reason)
                return
            }
            if (result.data.requiresTwoFactor) {
                setStatusMessage("")
                setPhase("twoFactor")
                return
            }
            session.adopt(result.data)
            router.push("/provisioning")
            return
        }

        const result = mode === "signUp"
            ? await signUpInit(details)
            : await forgotPasswordInit({ email: details.email })
        setIsPending(false)
        if (!result.ok) {
            refuse(result.reason)
            return
        }
        setEmail(details.email)
        adoptChallenge(result.data)
        setPhase("code")
    }

    /**
     * Spend the mailed code.
     *
     * @param code - The code, and the new password on the journey that sets one.
     */
    const submitCode = async (code: AuthCode) => {
        setIsPending(true)
        setIsError(false)
        setStatusMessage("")

        if (mode === "signUp") {
            const result = await signUpVerifyOtp({ challengeId: challengeId.current, otp: code.otp })
            setIsPending(false)
            if (!result.ok) {
                refuse(result.reason)
                return
            }
            // A brand new account has no second factor, so there is no challenge to read for here.
            session.adopt(result.data)
            setPhase("done")
            router.push("/provisioning")
            return
        }

        const result = await forgotPasswordVerifyOtp({
            challengeId: challengeId.current,
            otp: code.otp,
            newPassword: code.newPassword,
        })
        setIsPending(false)
        if (!result.ok) {
            // ONE SENTENCE FOR BOTH REFUSALS. `result.reason` is deliberately not shown.
            refuse(t("forgotPassword.codeRefused"))
            return
        }
        setStatusMessage("")
        setPhase("done")
    }

    /** Ask for another code. Refused inside the cooldown, which the control already says. */
    const resend = async () => {
        setIsPending(true)
        const result = mode === "signUp"
            ? await signUpResend({ challengeId: challengeId.current })
            : await forgotPasswordResend({ challengeId: challengeId.current })
        setIsPending(false)
        if (!result.ok) {
            refuse(result.reason)
            return
        }
        adoptChallenge(result.data)
        setIsError(false)
        setStatusMessage(t("resentLabel"))
    }

    /**
     * Everything the panel can do, in one place so each state hands over the same set.
     *
     * `onward` is the only one that reads the current journey: the reset journey finishes at a
     * password rather than a session, so its way onward is back to signing in - and the two-factor
     * notice has nowhere to go at all, since this build cannot complete that step.
     */
    const actions: AuthActions = {
        submitDetails: (details) => { void submitDetails(details) },
        submitCode: (code) => { void submitCode(code) },
        resend: () => { void resend() },
        back: clear,
        changeRememberMe: setIsRememberMe,
        changeMode: (next) => {
            setMode(next)
            clear()
        },
        chooseProvider: (provider) => {
            /*
             * The OAuth round trip has no client id, no PKCE verifier and no callback route in this
             * build, so it reports rather than pretends. A screen that looked connected and was not
             * is the kind of thing that gets believed.
             */
            setIsError(false)
            setStatusMessage(t("providerUnavailable", { provider: provider === "google" ? "Google" : provider }))
        },
        onward: () => {
            if (mode === "forgotPassword") {
                setMode("signIn")
                clear()
                return
            }
            if (phase === "twoFactor") {
                clear()
                return
            }
            router.push("/provisioning")
        },
    }

    const frame = { title: t(`${mode}.title`), subtitle: t(`${mode}.subtitle`), isPending }

    /*
     * THE PANEL'S SITUATION, RESOLVED HERE AND HANDED OVER WHOLE. Every string is read as
     * `<mode>.<key>` out of one namespace, so a fourth journey would be a catalogue change rather
     * than a branch - and the drawing half never learns which language it is in.
     */
    const panel: AuthenticationPanelProps = phase === "twoFactor"
        ? {
            state: "twoFactorUnsupported",
            props: {
                ...frame,
                statusMessage: "",
                // A challenge is not a refusal: the password was right and the session is simply not
                // owed yet.
                isError: false,
                doneTitle: t("signIn.twoFactorTitle"),
                doneHint: t("signIn.twoFactorHint"),
                onwardLabel: t("signIn.backLabel"),
            },
            on: actions,
        }
        : phase === "done"
            ? {
                state: "done",
                props: {
                    ...frame,
                    statusMessage,
                    isError,
                    doneTitle: t(`${mode}.doneTitle`),
                    doneHint: t(`${mode}.doneHint`),
                    onwardLabel: t(`${mode}.onwardLabel`),
                },
                on: actions,
            }
            : phase === "code"
                ? {
                    state: "code",
                    props: {
                        ...frame,
                        mode,
                        subtitle: t(`${mode}.codeSubtitle`, { email }),
                        statusMessage,
                        isError,
                        codeLabel: t("codeLabel"),
                        codePlaceholder: t("codePlaceholder"),
                        codeHint: t("codeHint", { minutes: ttlMinutes }),
                        newPasswordLabel: t("newPasswordLabel"),
                        newPasswordPlaceholder: t("newPasswordPlaceholder"),
                        newPasswordHint: t("newPasswordHint"),
                        revealLabel: t("revealLabel"),
                        hideLabel: t("hideLabel"),
                        submitLabel: t(`${mode}.codeSubmitLabel`),
                        resendLabel: t("resendLabel"),
                        cooldownLabel: cooldownSeconds === 0 ? "" : t("cooldownLabel", { seconds: cooldownSeconds }),
                        backLabel: t("backLabel"),
                    },
                    on: actions,
                }
                : {
                    state: "details",
                    props: {
                        ...frame,
                        mode,
                        statusMessage,
                        isError,
                        emailLabel: t("emailLabel"),
                        emailPlaceholder: t("emailPlaceholder"),
                        emailHint: t("emailHint"),
                        passwordLabel: t("passwordLabel"),
                        passwordPlaceholder: mode === "signUp" ? t("newAccountPasswordPlaceholder") : t("passwordPlaceholder"),
                        passwordHint: t("passwordHint"),
                        confirmPasswordLabel: t("confirmPasswordLabel"),
                        confirmPasswordPlaceholder: t("confirmPasswordPlaceholder"),
                        confirmPasswordMismatch: t("confirmPasswordMismatch"),
                        revealLabel: t("revealLabel"),
                        hideLabel: t("hideLabel"),
                        submitLabel: t(`${mode}.submitLabel`),
                        orLabel: t("orLabel"),
                        googleLabel: t("googleLabel"),
                        forgotPasswordLabel: t("forgotPasswordLabel"),
                        rememberMeLabel: t("rememberMeLabel"),
                        isRememberMe,
                        promptQuestion: t(`${mode}.promptQuestion`),
                        promptAction: t(`${mode}.promptAction`),
                    },
                    on: actions,
                }

    return <_AuthenticationPage panel={panel} />
}
