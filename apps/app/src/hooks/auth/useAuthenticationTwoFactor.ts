
import { useCallback, useRef } from "react"
import { useMutateVerifyTwoFactorSwr } from "@/hooks/swr/mutations/useMutateVerifyTwoFactorSwr"
import type { AuthFactor } from "@/components/blocks/auth/AuthenticationPanel"
import type { Session } from "@/modules/auth/session"
import type { AuthenticationFlowControl, AuthenticationTranslate } from "./auth.shared"

type UseAuthenticationTwoFactorOptions = {
    readonly control: AuthenticationFlowControl
    readonly session: Session
    readonly t: AuthenticationTranslate
}

/** Keep the opaque challenge out of render state and handle its one verification request. */
export const useAuthenticationTwoFactor = ({ control, session, t }: UseAuthenticationTwoFactorOptions) => {
    const verifyTwoFactor = useMutateVerifyTwoFactorSwr()
    const twoFactorToken = useRef("")
    const { markTwoFactor, runPending, clearFeedback, refuse, hesitate } = control

    const activate = useCallback(
        (token: string | null) => {
            twoFactorToken.current = token ?? ""
            markTwoFactor()
        },
        [markTwoFactor],
    )

    const clear = useCallback(() => {
        twoFactorToken.current = ""
    }, [])

    const submit = useCallback(
        async (factor: AuthFactor, landOnReturnTo: () => void): Promise<void> => {
            clearFeedback()
            const result = await runPending("submit", () =>
                verifyTwoFactor.trigger({
                    twoFactorToken: twoFactorToken.current,
                    code: factor.code,
                }),
            )
            if (!result.ok) {
                if (result.kind === "unavailable") {
                    hesitate(t("signIn.undecided"))
                    return
                }
                refuse(t("signIn.twoFactorRefused"))
                return
            }
            if (result.data.requiresTwoFactor || result.data.accessToken === null) {
                refuse(t("signIn.twoFactorRefused"))
                return
            }
            session.adopt(result.data)
            landOnReturnTo()
        },
        [clearFeedback, hesitate, refuse, runPending, session, t, verifyTwoFactor],
    )

    return { activate, clear, submit }
}
