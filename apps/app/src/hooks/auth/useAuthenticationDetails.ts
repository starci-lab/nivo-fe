
import { useCallback, useEffect, useRef, useState } from "react"
import { useMutateForgotPasswordInitSwr } from "@/hooks/swr/mutations/useMutateForgotPasswordInitSwr"
import { useMutateSignInSwr } from "@/hooks/swr/mutations/useMutateSignInSwr"
import { useMutateSignUpInitSwr } from "@/hooks/swr/mutations/useMutateSignUpInitSwr"
import { useOauthReturnExchange } from "@/hooks/swr/mutations/useOauthReturnExchange"
import { useMutateContinueBrokeredSignInSwr } from "@/hooks/swr/mutations/useMutateContinueBrokeredSignInSwr"
import { useRouter } from "@/hooks/i18n/useRouter"
import { useSession } from "@/hooks/auth/useSession"
import useSWRImmutable from "swr/immutable"
import type { AuthDetails, AuthMode, AuthProvider } from "@/components/blocks/auth/AuthenticationPanel"
import type { OtpChallenge } from "@/modules/api/__generated__/core"

import {
    settleBrokeredAnswer,
    submitAuthenticationDetails,
    type AuthenticationFlowControl,
    type AuthenticationTranslate,
} from "./auth.shared"
import { authenticationDestination, readAuthenticationArrival, readAuthenticationReturnToFromBrowser } from "@/modules/auth/authentication-arrival"
import { continuationReference } from "@/modules/auth/authentication"
import { removeStored, RETURN_TO_STORAGE_KEY, writeStored } from "@/modules/browser-storage"
import { authenticationOauthRedirectUrl, rememberOauthProvider } from "@/modules/auth"

type UseAuthenticationDetailsOptions = {
    readonly control: AuthenticationFlowControl
    readonly t: AuthenticationTranslate
    readonly activateTwoFactor: (token: string | null) => void
    readonly isSignedInArrival: boolean
}

/** Own the credential step, provider action, return destination and session placement. */
export const useAuthenticationDetails = ({
    control,
    t,
    activateTwoFactor,
    isSignedInArrival,
}: UseAuthenticationDetailsOptions) => {
    const router = useRouter()
    const session = useSession()
    const signInMutation = useMutateSignInSwr()
    const signUpInit = useMutateSignUpInitSwr()
    const forgotPasswordInit = useMutateForgotPasswordInitSwr()
    const continueBrokered = useMutateContinueBrokeredSignInSwr()
    const oauthReturn = useOauthReturnExchange()
    const [mode, setMode] = useState<AuthMode>("signIn")
    const [isRememberMe, setIsRememberMe] = useState(true)
    const [arrival] = useState(readAuthenticationArrival)
    const [providerRefusalVisible, setProviderRefusalVisible] = useState(arrival.refused)
    const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null)
    const [returnTo] = useState(readAuthenticationReturnToFromBrowser)
    const signInIdentity = useRef<string | null>(null)
    const hasAdoptedOauth = useRef(false)
    const hasLanded = useRef(false)
    const { clearFeedback, hesitate, refuse, runPending, setPendingAction } = control

    useEffect(() => {
        if (returnTo === null) return
        writeStored("session", RETURN_TO_STORAGE_KEY, returnTo)
    }, [returnTo])

    const arriveAt = useCallback(
        (place: string) => {
            hasLanded.current = true
            removeStored("session", RETURN_TO_STORAGE_KEY)
            router.push(place)
        },
        [router],
    )
    const landOnDestination = useCallback(
        (resolved: string | null) => arriveAt(authenticationDestination(returnTo, resolved)),
        [arriveAt, returnTo],
    )
    const landOnReturnTo = useCallback(() => arriveAt(authenticationDestination(returnTo, null)), [arriveAt, returnTo])

    useEffect(() => {
        if (isSignedInArrival && !hasLanded.current) landOnReturnTo()
    }, [isSignedInArrival, landOnReturnTo])

    const submit = useCallback(
        (details: AuthDetails, startCode: (email: string, challenge: OtpChallenge) => void): Promise<void> => {
            setProviderRefusalVisible(false)
            return submitAuthenticationDetails({
                mode,
                details,
                returnTo,
                signInIdentity,
                signIn: (input) => signInMutation.trigger(input),
                signUpInit: (input) => signUpInit.trigger(input),
                forgotPasswordInit: (input) => forgotPasswordInit.trigger(input),
                runPending,
                session,
                t,
                clearFeedback,
                refuse,
                hesitate,
                activateTwoFactor,
                landOnDestination,
                startCode,
            })
        },
        [
            activateTwoFactor,
            clearFeedback,
            forgotPasswordInit,
            hesitate,
            landOnDestination,
            mode,
            refuse,
            returnTo,
            runPending,
            session,
            signInMutation,
            signUpInit,
            t,
        ],
    )

    const chooseProvider = useCallback(
        (provider: AuthProvider) => {
            rememberOauthProvider(provider)
            clearFeedback()
            setProviderRefusalVisible(false)
            setPendingAction("provider")
            setPendingProvider(provider)
            const returnUrl = `${window.location.origin}${window.location.pathname}`
            window.location.assign(authenticationOauthRedirectUrl(provider, returnUrl))
        },
        [clearFeedback, setPendingAction],
    )

    const settleBrokered = useCallback(
        (answer: Parameters<typeof settleBrokeredAnswer>[0]) =>
            settleBrokeredAnswer(answer, {
                session,
                t,
                activateTwoFactor,
                clearFeedback,
                hesitate,
                refuse,
                landOnReturnTo,
            }),
        [activateTwoFactor, clearFeedback, hesitate, landOnReturnTo, refuse, session, t],
    )

    const exchangeAnswer = oauthReturn.answer
    const continuationId =
        exchangeAnswer?.ok === true ? continuationReference(exchangeAnswer.data) : null
    const continuation = useSWRImmutable(
        continuationId === null ? null : (["AUTH_BROKERED_CONTINUATION", continuationId] as const),
        ([, reference]) => continueBrokered.trigger({ continuationReference: reference }),
    )

    useEffect(() => {
        if (exchangeAnswer === undefined || hasAdoptedOauth.current) return
        if (!exchangeAnswer.ok) {
            hasAdoptedOauth.current = true
            if (exchangeAnswer.kind === "unavailable") hesitate(t("signIn.oauthUndecided"))
            else refuse(t("signIn.oauthRefused"))
        } else if (exchangeAnswer.data.undecided !== null && continuationId !== null) {
            const continuationAnswer = continuation.data
            if (continuationAnswer !== undefined) {
                hasAdoptedOauth.current = true
                if (!continuationAnswer.ok) {
                    if (continuationAnswer.kind === "unavailable") hesitate(t("signIn.oauthUndecided"))
                    else refuse(t("signIn.oauthRefused"))
                } else {
                    settleBrokered(continuationAnswer.data)
                }
            }
        } else {
            hasAdoptedOauth.current = true
            settleBrokered(exchangeAnswer.data)
        }
    }, [continuation.data, continuationId, exchangeAnswer, hesitate, refuse, settleBrokered, t])

    return {
        mode,
        changeMode: setMode,
        isRememberMe,
        setIsRememberMe,
        pendingProvider: pendingProvider ?? arrival.provider ?? undefined,
        providerRefusalVisible,
        clearProviderRefusal: useCallback(() => setProviderRefusalVisible(false), []),
        submit,
        chooseProvider,
        landOnReturnTo,
        oauthIsMutating: oauthReturn.isMutating,
    }
}
