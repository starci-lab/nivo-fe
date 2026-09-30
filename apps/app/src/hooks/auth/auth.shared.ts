import type { AuthDetails, AuthMode, AuthPendingAction } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthPhase } from "@/modules/auth/authentication"
import type {
    ContinueBrokeredSignInPayload,
    ExchangeOauthCodePayload,
    ForgotPasswordInitInput,
    OtpChallenge,
    SignInInput,
    SignInPayload,
    SignUpInitInput,
} from "@/modules/api/__generated__/core"

import { type Outcome } from "@nivo/api"
import type { Session } from "@/modules/auth/session"

/** The authentication catalogue translator accepted by the flow hooks. */
export type AuthenticationTranslate = (key: string, values?: Record<string, string | number>) => string

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
            } else {
                signInIdentity.current = null
                refuse(t("signIn.refused"))
            }
        } else {
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
            session.adopt({
                accessToken: result.data.accessToken,
                requiresTwoFactor: result.data.requiresTwoFactor,
                twoFactorToken: result.data.twoFactorToken,
            })
            landOnDestination(result.data.destination)
        }
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
    } else {
        startCode(details.email, result.data)
    }
}

type BrokeredSettlementOptions = {
    readonly session: Session
    readonly t: AuthenticationTranslate
    readonly activateTwoFactor: (token: string | null) => void
    readonly clearFeedback: () => void
    readonly hesitate: (message: string) => void
    readonly refuse: (message: string) => void
    readonly landOnReturnTo: () => void
}

/** Settle a brokered answer after any continuation has been read through SWR. */
export const settleBrokeredAnswer = (
    answer: ExchangeOauthCodePayload | ContinueBrokeredSignInPayload,
    options: BrokeredSettlementOptions,
): void => {
    const {
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
        hesitate(t("signIn.oauthUndecided"))
        return
    }
    if (answer.accessToken === null) {
        refuse(t("signIn.oauthRefused"))
        return
    }
    session.adopt({
        accessToken: answer.accessToken,
        requiresTwoFactor: answer.requiresTwoFactor,
        twoFactorToken: answer.twoFactorToken,
    })
    landOnReturnTo()
}
