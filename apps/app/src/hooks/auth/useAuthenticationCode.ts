
import { useCallback, useEffect, useState } from "react"
import { useMutateForgotPasswordResendSwr } from "@/hooks/swr/mutations/useMutateForgotPasswordResendSwr"
import { useMutateForgotPasswordVerifyOtpSwr } from "@/hooks/swr/mutations/useMutateForgotPasswordVerifyOtpSwr"
import { useMutateSignUpResendSwr } from "@/hooks/swr/mutations/useMutateSignUpResendSwr"
import { useMutateSignUpVerifyOtpSwr } from "@/hooks/swr/mutations/useMutateSignUpVerifyOtpSwr"
import type { AuthCode, AuthMode } from "@/components/blocks/auth/AuthenticationPanel"

import { noticeForConclusion } from "@/modules/auth/authentication"
import type { Session } from "@/modules/auth/session"
import type { AuthenticationFlowControl, AuthenticationTranslate } from "./auth.shared"

type UseAuthenticationCodeOptions = {
    readonly mode: AuthMode
    readonly control: AuthenticationFlowControl
    readonly session: Session
    readonly t: AuthenticationTranslate
    readonly showNotice: (notice: "heldAddress" | "createdNoSession") => void
    readonly activateTwoFactor: (token: string | null) => void
}

/** Own the mailed-code challenge, its lifetime display, resend clock and verification. */
export const useAuthenticationCode = ({
    mode,
    control,
    session,
    t,
    showNotice,
    activateTwoFactor,
}: UseAuthenticationCodeOptions) => {
    const signUpResend = useMutateSignUpResendSwr()
    const signUpVerify = useMutateSignUpVerifyOtpSwr()
    const forgotResend = useMutateForgotPasswordResendSwr()
    const forgotVerify = useMutateForgotPasswordVerifyOtpSwr()
    const [challenge, setChallenge] = useState<OtpChallenge | null>(null)
    const [email, setEmail] = useState("")
    const [ttlMinutes, setTtlMinutes] = useState(0)
    const [cooldownSeconds, setCooldownSeconds] = useState(0)
    const { markCode, markDone, runPending, clearFeedback, refuse, hesitate } = control

    const start = useCallback(
        (address: string, nextChallenge: OtpChallenge) => {
            setEmail(address)
            setChallenge(nextChallenge)
            setTtlMinutes(Math.max(1, Math.round(nextChallenge.expiresInSeconds / 60)))
            setCooldownSeconds(60)
            markCode()
        },
        [markCode],
    )

    const clear = useCallback(() => {
        setChallenge(null)
        setEmail("")
        setTtlMinutes(0)
        setCooldownSeconds(0)
    }, [])

    useEffect(() => {
        if (cooldownSeconds === 0) return undefined
        const timer = setTimeout(() => setCooldownSeconds((left) => left - 1), 1000)
        return () => clearTimeout(timer)
    }, [cooldownSeconds])

    const submit = useCallback(
        async (code: AuthCode): Promise<void> => {
            clearFeedback()
            const challengeId = challenge?.challengeId ?? ""
            if (mode === "signUp") {
                const result = await runPending("submit", () => signUpVerify.trigger({ challengeId, otp: code.otp }))
                if (!result.ok) {
                    if (result.kind === "unavailable") {
                        hesitate(t("signUp.undecided"))
                        return
                    }
                    refuse(t("signUp.codeRefused"))
                    return
                }
                if (result.data.requiresTwoFactor) {
                    activateTwoFactor(result.data.twoFactorToken)
                    return
                }
                if (result.data.conclusion !== null) {
                    const notice = noticeForConclusion(result.data.conclusion.reason)
                    if (notice !== null) {
                        showNotice(notice)
                        return
                    }
                    markDone()
                    return
                }
                if (result.data.undecided !== null) {
                    hesitate(t("signUp.undecided"))
                    return
                }
                if (result.data.accessToken === null) {
                    refuse(t("signUp.codeRefused"))
                    return
                }
                session.adopt(result.data)
                markDone()
                return
            }

            const result = await runPending("submit", () =>
                forgotVerify.trigger({ challengeId, otp: code.otp, newPassword: code.newPassword }),
            )
            if (!result.ok) {
                if (result.kind === "unavailable") {
                    hesitate(t("signUp.undecided"))
                    return
                }
                refuse(t("forgotPassword.codeRefused"))
                return
            }
            clearFeedback()
            markDone()
        },
        [
            activateTwoFactor,
            challenge,
            clearFeedback,
            forgotVerify,
            hesitate,
            markDone,
            mode,
            refuse,
            runPending,
            session,
            showNotice,
            signUpVerify,
            t,
        ],
    )

    const resend = useCallback(async (): Promise<void> => {
        const challengeId = challenge?.challengeId ?? ""
        const result = await runPending("resend", () =>
            mode === "signUp" ? signUpResend.trigger({ challengeId }) : forgotResend.trigger({ challengeId }),
        )
        if (!result.ok) {
            refuse(t("resendRefused"))
            return
        }
        setChallenge(result.data)
        setTtlMinutes(Math.max(1, Math.round(result.data.expiresInSeconds / 60)))
        setCooldownSeconds(60)
        clearFeedback()
        hesitate(t("resentLabel"))
    }, [challenge, clearFeedback, forgotResend, hesitate, mode, refuse, runPending, signUpResend, t])

    return { challenge, email, ttlMinutes, cooldownSeconds, start, clear, submit, resend }
}
