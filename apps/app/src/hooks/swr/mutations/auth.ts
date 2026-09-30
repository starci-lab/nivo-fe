"use client"

import { useState } from "react"
import useSWRImmutable from "swr/immutable"
import useSWRMutation from "swr/mutation"
import {
    exchangeOauthCode,
    forgotPasswordInit,
    forgotPasswordResend,
    forgotPasswordVerifyOtp,
    signIn,
    signUpInit,
    signUpResend,
    signUpVerifyOtp,
    verifyTwoFactor,
} from "@/modules/api/auth"
import { takeOauthProvider } from "@/modules/auth"
type AuthMutationTrigger<TInput> = {
    readonly arg: TInput
}

/** Own one public authentication command; unlike viewer mutations it is intentionally signed-out. */
const useAuthMutation = <TAnswer, TInput>(key: string, mutation: (input: TInput) => Promise<TAnswer>) =>
    useSWRMutation(["NIVO_AUTH_MUTATION", key] as const, (_key, { arg }: AuthMutationTrigger<TInput>) => mutation(arg))

/** Own the signed-out password exchange. */
export const useMutateSignInSwr = () => useAuthMutation("sign-in", signIn)
/** Own completion of a sign-in that requires an authenticator code. */
export const useMutateVerifyTwoFactorSwr = () => useAuthMutation("verify-two-factor", verifyTwoFactor)
/** Own the first step of mailed-code account creation. */
export const useMutateSignUpInitSwr = () => useAuthMutation("sign-up-init", signUpInit)
/** Own renewal of an account-creation code. */
export const useMutateSignUpResendSwr = () => useAuthMutation("sign-up-resend", signUpResend)
/** Own the account-creation code exchange. */
export const useMutateSignUpVerifyOtpSwr = () => useAuthMutation("sign-up-verify", signUpVerifyOtp)
/** Own the first step of password recovery. */
export const useMutateForgotPasswordInitSwr = () => useAuthMutation("forgot-password-init", forgotPasswordInit)
/** Own renewal of a password-recovery code. */
export const useMutateForgotPasswordResendSwr = () => useAuthMutation("forgot-password-resend", forgotPasswordResend)
/** Own the password-recovery code exchange. */
export const useMutateForgotPasswordVerifyOtpSwr = () =>
    useAuthMutation("forgot-password-verify", forgotPasswordVerifyOtp)
type OauthReturnAnswer = Awaited<ReturnType<typeof exchangeOauthCode>>

/** What the provider left in the address when it sent the reader back. */
type OauthReturn = {
    readonly code: string | null
    readonly state: string | null
}

/** Read the provider's return from the address; a pure read, so it can seed state. */
const readOauthReturn = (): OauthReturn | null => {
    if (typeof window === "undefined") return null
    const query = new URLSearchParams(window.location.search)
    const code = query.get("code")
    const state = query.get("state")
    const wasRefused = query.has("error")
    if ((code === null || state === null) && !wasRefused) return null
    return { code, state }
}

/**
 * Spend an OAuth return exactly once. The hook owns the network effect so the page only reacts to
 * the settled authentication result and never imports or invokes transport from a component effect.
 *
 * The return is keyed by its own code and state, so SWR runs the exchange once per return however
 * often the page re-renders or remounts; the address is cleaned as the exchange starts.
 */
export const useOauthReturnExchange = () => {
    const exchange = useAuthMutation("oauth-exchange", exchangeOauthCode)
    const [oauthReturn] = useState(readOauthReturn)
    const { data: answer } = useSWRImmutable<OauthReturnAnswer | undefined>(
        oauthReturn === null ? null : (["OAUTH_RETURN_EXCHANGE", oauthReturn.code, oauthReturn.state] as const),
        async () => {
            const provider = takeOauthProvider()
            window.history.replaceState(null, "", window.location.pathname)
            if (oauthReturn === null || oauthReturn.code === null || oauthReturn.state === null) return undefined
            return exchange.trigger({
                code: oauthReturn.code,
                provider,
                state: oauthReturn.state,
            })
        },
    )
    return {
        answer,
        isMutating: exchange.isMutating,
    }
}
