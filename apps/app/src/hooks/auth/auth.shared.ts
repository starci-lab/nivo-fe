import type { AuthDetails, AuthMode, AuthPendingAction } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthPhase } from "@/modules/auth/authentication"

import { type Outcome } from "@nivo/api"
import type { Session } from "@/modules/auth/session"
import { continuationReference, UNAVAILABLE_RETURN_LANDING } from "@/modules/auth/authentication"
import { OAUTH_PROVIDER_KEY, readStored, RETURN_TO_STORAGE_KEY } from "@/modules/browser-storage"
import { DEFAULT_AUTHENTICATED_LANDING, validatedReturnTo } from "@/modules/auth"

/** The authentication catalogue translator accepted by the flow hooks. */
export type AuthenticationTranslate = (key: string, values?: Record<string, string | number>) => string

/** Initial navigation facts carried through a provider round trip. */
type AuthenticationArrival = {
    readonly provider: "google" | "github" | null
    readonly refused: boolean
}

/** Read the validated return intent once, falling back to the value saved before provider navigation. */
export const readAuthenticationReturnToFromBrowser = (): string | null => {
    if (typeof window === "undefined") return null
    return readAuthenticationReturnTo(window.location.search, readStored("session", RETURN_TO_STORAGE_KEY))
}

/** Read only the provider label and refusal marker from the arriving address. */
export const readAuthenticationArrival = (): AuthenticationArrival => {
    if (typeof window === "undefined") return { provider: null, refused: false }
    const remembered = readStored("session", OAUTH_PROVIDER_KEY)
    return {
        provider: remembered === "github" || remembered === "google" ? remembered : null,
        refused: new URLSearchParams(window.location.search).has("error"),
    }
}

/** A sentence and whether it reports a refusal. */
type AuthenticationFeedback = {
    readonly statusMessage: string
    readonly isError: boolean
}

/** Shared state and actions for work that can be pending on the page. */
export type AuthenticationFlowControl = {
    readonly phase: AuthPhase
    readonly feedback: AuthenticationFeedback
    readonly pendingAction: AuthPendingAction | null
    readonly markCode: () => void
    readonly markDone: () => void
    readonly markTwoFactor: () => void
    readonly resetFlow: () => void
    readonly clearFeedback: () => void
    readonly refuse: (message: string) => void
    readonly hesitate: (message: string) => void
    readonly setPendingAction: (action: AuthPendingAction | null) => void
    readonly runPending: <Answer>(action: AuthPendingAction, request: () => Promise<Answer>) => Promise<Answer>
}

/** Read the interrupted path once, preferring the live address over its provider-round-trip copy. */
export const readAuthenticationReturnTo = (search: string, stored: string | null): string | null => {
    const fromAddress = validatedReturnTo(new URLSearchParams(search).get("returnTo"))
    return fromAddress ?? validatedReturnTo(stored)
}

/** Place an authenticated reader at the backend's answer or the validated return intent. */
export const authenticationDestination = (asked: string | null, resolved: string | null): string => {
    const answered = validatedReturnTo(resolved)
    if (asked !== null && answered !== null && answered !== asked) return UNAVAILABLE_RETURN_LANDING
    return answered ?? asked ?? DEFAULT_AUTHENTICATED_LANDING
}

type DetailSubmissionOptions = {
    readonly mode: AuthMode
    readonly details: AuthDetails
    readonly returnTo: string | null
    readonly signInIdentity: { current: string | null }
    readonly signIn: (input: SignInInput) => Promise<Outcome<SignInPayload>>
    readonly signUpInit: (input: SignUpInitInput) => Promise<Outcome<OtpChallenge>>
    readonly forgotPasswordInit: (input: ForgotPasswordInitInput) => Promise<Outcome<OtpChallenge>>
    readonly runPending: <Answer>(action: AuthPendingAction, request: () => Promise<Answer>) => Promise<Answer>
    readonly session: Session
    readonly t: AuthenticationTranslate
    readonly clearFeedback: () => void
    readonly refuse: (message: string) => void
    readonly hesitate: (message: string) => void
    readonly activateTwoFactor: (token: string | null) => void
    readonly landOnDestination: (destination: string | null) => void
    readonly startCode: (email: string, challenge: OtpChallenge) => void
}

/** Submit sign-in, sign-up initiation or password-reset initiation. */
export const submitAuthenticationDetails = async (options: DetailSubmissionOptions): Promise<void> => {
    const {
        mode,
        details,
        returnTo,
        signInIdentity,
        signIn,
        signUpInit,
        forgotPasswordInit,
        runPending,
        session,
        t,
        clearFeedback,
        refuse,
        hesitate,
        activateTwoFactor,
        landOnDestination,
        startCode,
    } = options
    clearFeedback()
    if (mode === "signIn") {
        if (signInIdentity.current === null && typeof crypto !== "undefined" && crypto.randomUUID)
            signInIdentity.current = crypto.randomUUID()
        const result = await runPending("submit", () =>
            signIn({
                email: details.email,
                password: details.password,
                ...(signInIdentity.current === null ? {} : { requestIdentity: signInIdentity.current }),
                ...(returnTo === null ? {} : { requestedDestination: returnTo }),
            }),
        )
        if (!result.ok) {
            if (result.kind === "unavailable") {
                hesitate(t("signIn.undecided"))
                return
            }
            signInIdentity.current = null
            refuse(t("signIn.refused"))
            return
        }
        if (result.data.requiresTwoFactor) {
            signInIdentity.current = null
            activateTwoFactor(result.data.twoFactorToken)
            clearFeedback()
            return
        }
        if (result.data.undecided !== null) {
            hesitate(t("signIn.undecided"))
            return
        }
        if (result.data.accessToken === null) {
            signInIdentity.current = null
            refuse(t("signIn.refused"))
            return
        }
        signInIdentity.current = null
        session.adopt(result.data)
        landOnDestination(result.data.destination)
        return
    }

    const result = await runPending("submit", () =>
        mode === "signUp"
            ? signUpInit({
                  email: details.email,
                  password: details.password,
                  ...(details.name === "" ? {} : { name: details.name }),
              })
            : forgotPasswordInit({ email: details.email }),
    )
    if (!result.ok) {
        refuse(mode === "signUp" ? t("signUp.mailRefused") : t("forgotPassword.mailRefused"))
        return
    }
    startCode(details.email, result.data)
}

type BrokeredSettlementOptions = {
    readonly continueBrokered: (input: ContinueBrokeredSignInInput) => Promise<Outcome<ContinueBrokeredSignInPayload>>
    readonly runPending: AuthenticationFlowControl["runPending"]
    readonly session: Session
    readonly t: AuthenticationTranslate
    readonly activateTwoFactor: (token: string | null) => void
    readonly clearFeedback: () => void
    readonly hesitate: (message: string) => void
    readonly refuse: (message: string) => void
    readonly landOnReturnTo: () => void
}

/** Read brokered answers in contract order, continuing an undecided held proof once. */
export const settleBrokeredAnswer = async (
    answer: ExchangeOauthCodePayload | ContinueBrokeredSignInPayload,
    options: BrokeredSettlementOptions,
): Promise<void> => {
    const {
        continueBrokered,
        runPending,
        session,
        t,
        activateTwoFactor,
        clearFeedback,
        hesitate,
        refuse,
        landOnReturnTo,
    } = options
    if (answer.requiresTwoFactor) {
        activateTwoFactor(answer.twoFactorToken)
        clearFeedback()
        return
    }
    if (answer.providerEmailRefused === true) {
        refuse(t("signIn.oauthEmailRefused"))
        return
    }
    if (answer.undecided !== null) {
        const reference = continuationReference(answer)
        if (reference === null) {
            hesitate(t("signIn.oauthUndecided"))
            return
        }
        const continued = await runPending("provider", () => continueBrokered({ continuationReference: reference }))
        if (!continued.ok) {
            if (continued.kind === "unavailable") hesitate(t("signIn.oauthUndecided"))
            else refuse(t("signIn.oauthRefused"))
            return
        }
        await settleBrokeredAnswer(continued.data, options)
        return
    }
    if (answer.accessToken === null) {
        refuse(t("signIn.oauthRefused"))
        return
    }
    session.adopt(answer)
    landOnReturnTo()
}
