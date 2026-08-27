"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useEffect, useRef, useState } from "react"
import {
    authenticationOauthRedirectUrl,
    rememberOauthProvider,
    useMutateForgotPasswordInitSwr,
    useMutateForgotPasswordResendSwr,
    useMutateForgotPasswordVerifyOtpSwr,
    useMutateSignInSwr,
    useMutateSignUpInitSwr,
    useMutateSignUpResendSwr,
    useMutateSignUpVerifyOtpSwr,
    useOauthReturnExchange,
} from "@/hooks/swr"
import { AuthenticationPageBase as AuthenticationPageView } from "./component"
import type {
    AuthActions,
    AuthCode,
    AuthDetails,
    AuthMode,
    AuthenticationPanelProps,
} from "@/components/blocks/auth/AuthenticationPanel"
import type { OtpChallenge } from "@/modules/api/auth"
import { useSession } from "@/modules/auth/session"

/**
 * PAGE - `/authentication`, connected half.
 *
 * IT RESOLVES THE WORLD AND RENDERS ONLY ITS TWIN. Seven mutations, one challenge, one cooldown
 * clock and the mode live here; `AuthenticationPageBase` receives finished values and draws them.
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
 *
 * THE PROVIDER JOURNEY LEAVES AND COMES BACK TO THIS SAME ADDRESS, which is why it is a fourth
 * journey handled here rather than a route of its own. Pressing the shortcut navigates to the
 * backend's redirect endpoint naming this page as the return address; the backend mints the PKCE
 * pair, keeps the verifier and sends the reader to Keycloak; Keycloak returns them here with `code`
 * and `state` on the query, and the effect below spends that pair for a session. A separate
 * `/callback` screen would be a second surface that could only ever say "please wait" and then
 * repeat this page's own refusal and two-factor endings in its own words.
 *
 * THE VERIFIER IS NEVER HERE. It is generated and held by the backend for the whole round trip, so
 * the worst a script that can read this page can steal is an authorization code it cannot spend.
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
    const signInMutation = useMutateSignInSwr()
    const signUpInitMutation = useMutateSignUpInitSwr()
    const signUpResendMutation = useMutateSignUpResendSwr()
    const signUpVerifyMutation = useMutateSignUpVerifyOtpSwr()
    const forgotPasswordInitMutation = useMutateForgotPasswordInitSwr()
    const forgotPasswordResendMutation = useMutateForgotPasswordResendSwr()
    const forgotPasswordVerifyMutation = useMutateForgotPasswordVerifyOtpSwr()
    const oauthReturn = useOauthReturnExchange()
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
    /*
     * ONE HAND-OFF PER ARRIVAL, held in a ref because the guard has to outlive a re-render and must
     * not cause one. `state` is spent by the first exchange, so a second attempt is refused by
     * design - and development's deliberate double-mounting would otherwise turn a working sign-in
     * into a refusal that appears only on a developer's machine.
     */
    const hasAdoptedOauth = useRef(false)

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

    /*
     * THE RETURN LEG OF A PROVIDER SIGN-IN.
     *
     * THE QUERY IS READ FROM THE ADDRESS RATHER THAN FROM `useSearchParams`. That hook makes the
     * whole route client-rendered unless it is wrapped in a boundary, and what is wanted here is one
     * read at mount rather than a subscription to a query string that never changes under this page.
     *
     * THE QUERY IS CLEARED BEFORE THE EXCHANGE, NOT AFTER. `state` is single-use, so a reader who
     * reloads mid-flight would otherwise replay a handle the backend has already spent and be told
     * their sign-in failed when it did not - and the code would sit in the address bar, in history,
     * and in whatever the reader pastes into a support ticket.
     *
     * A CHALLENGE IS READ BEFORE A TOKEN, exactly as the password journey does. `session.adopt`
     * ignores a payload that still owes a second factor, so a page that adopted first and routed on
     * would send that reader to a console they are not signed in to, silently.
     */
    useEffect(() => {
        const result = oauthReturn.answer
        if (result === undefined || hasAdoptedOauth.current) return
        hasAdoptedOauth.current = true
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
        router.push("/overview")
    }, [oauthReturn.answer, router, session])

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
            const result = await signInMutation.trigger(details)
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
            router.push("/overview")
            return
        }

        const result = mode === "signUp"
            ? await signUpInitMutation.trigger(details)
            : await forgotPasswordInitMutation.trigger({ email: details.email })
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
            const result = await signUpVerifyMutation.trigger({ challengeId: challengeId.current, otp: code.otp })
            setIsPending(false)
            if (!result.ok) {
                refuse(result.reason)
                return
            }
            // A brand new account has no second factor, so there is no challenge to read for here.
            session.adopt(result.data)
            setPhase("done")
            router.push("/overview")
            return
        }

        const result = await forgotPasswordVerifyMutation.trigger({
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
            ? await signUpResendMutation.trigger({ challengeId: challengeId.current })
            : await forgotPasswordResendMutation.trigger({ challengeId: challengeId.current })
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
             * A FULL-PAGE NAVIGATION RATHER THAN `router.push`. The destination is the backend, which
             * answers 302 towards Keycloak. Next's router moves between this app's own routes and has
             * nowhere to send this; and the reader genuinely leaves - the whole point of the trip is
             * that it happens outside this document.
             *
             * THE RETURN ADDRESS IS THIS PAGE WITH ITS QUERY AND HASH DROPPED. Dropped, because the
             * backend replays that string verbatim at the token exchange and Keycloak compares the
             * two - so anything that could differ between the leg out and the leg back has to go.
             * This page, because the reader came from here and should land back in the language they
             * left from; `pathname` already carries the locale prefix when there is one.
             *
             * THE CONTROLS ARE DELIBERATELY NOT LOCKED. Locking them reads as the careful choice and
             * is the trap: a reader who presses Back from the provider can be restored from the
             * browser's cache with this component's state exactly as it was left, and a form frozen
             * pending a request that will never answer is a dead end only a reload escapes. A second
             * press costs nothing instead - each hand-off mints its own state on the backend and the
             * one that is completed is the one that counts.
             */
            rememberOauthProvider(provider)
            setIsError(false)
            setStatusMessage(t("providerUnavailable", { provider: provider === "google" ? "Google" : provider }))
            const returnTo = `${window.location.origin}${window.location.pathname}`
            window.location.assign(authenticationOauthRedirectUrl(provider, returnTo))
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
            router.push("/overview")
        },
    }

    const frame = { title: t(`${mode}.title`), subtitle: t(`${mode}.subtitle`), isPending: isPending || oauthReturn.isMutating }

    /*
     * THE PANEL'S SITUATION, RESOLVED HERE AND HANDED OVER WHOLE. Every string is read as
     * `<mode>.<key>` out of one namespace, so a fourth journey would be a catalogue change rather
     * than a branch - and the drawing half never learns which language it is in.
     *
     * FOUR SITUATIONS, SETTLED ONE AT A TIME. Each phase answers with the whole panel and leaves, so
     * a reader confirms the situation in front of them without holding the other three open while
     * they read it. The order still matters and is the journey's own: a challenge outranks a
     * finished journey, a finished journey outranks a code, and the details are where every journey
     * starts.
     */
    const panelFor = (): AuthenticationPanelProps => {
        if (phase === "twoFactor") {
            return {
                state: "twoFactorUnsupported",
                props: {
                    ...frame,
                    statusMessage: "",
                    // A challenge is not a refusal: the password was right and the session is simply
                    // not owed yet.
                    isError: false,
                    doneTitle: t("signIn.twoFactorTitle"),
                    doneHint: t("signIn.twoFactorHint"),
                    onwardLabel: t("signIn.backLabel"),
                },
                on: actions,
            }
        }
        if (phase === "done") {
            return {
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
        }
        if (phase === "code") {
            return {
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
        }
        return {
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
    }

    const panel = panelFor()

    return <AuthenticationPageView panel={panel} />
}
