"use client"

import { Suspense, useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { RouteLoadingView } from "@nivo/ui"
import {
    useAuthenticationCode,
    useAuthenticationDetails,
    useAuthenticationNotice,
    useAuthenticationPhase,
    useAuthenticationTwoFactor,
    usePathname,
    useRouter,
    useSession,
} from "@/hooks"
import type { AuthActions, AuthMode, AuthenticationPanelProps } from "@/components/blocks/auth/AuthenticationPanel"
import { SessionEndingQuery } from "@/components/blocks/auth/SessionEndingQuery"
import type { SessionEndingArrival } from "@/modules/auth/authentication"
import { AuthenticationPageView, authenticationPanelFor } from "./component"

/** Empty route input: authentication is resolved from the current session and address. */
export type AuthenticationPageProps = Record<string, never>

type AuthenticationPageConnectedProps = {
    readonly sessionEnding: SessionEndingArrival | null
}

const AuthenticationPageConnected = ({ sessionEnding }: AuthenticationPageConnectedProps) => {
    const t = useTranslations("authentication")
    const router = useRouter()
    const pathname = usePathname()
    const session = useSession()
    const notice = useAuthenticationNotice({ sessionEnding, pathname, router })
    const flow = useAuthenticationPhase({ noticeKind: notice.noticeKind })
    const twoFactor = useAuthenticationTwoFactor({ control: flow, session, t })
    const isSignedInArrival = session.state.status === "signed-in" && flow.phase === "details"
    const details = useAuthenticationDetails({
        control: flow,
        t,
        activateTwoFactor: twoFactor.activate,
        isSignedInArrival,
    })
    const code = useAuthenticationCode({
        mode: details.mode,
        control: flow,
        session,
        t,
        showNotice: notice.show,
        activateTwoFactor: twoFactor.activate,
    })
    const isRestoring = session.state.status === "restoring"

    const clear = useCallback(() => {
        code.clear()
        twoFactor.clear()
        notice.clear()
        details.clearProviderRefusal()
        flow.clearFeedback()
        flow.resetFlow()
    }, [code, details, flow, notice, twoFactor])

    const changeMode = useCallback(
        (mode: AuthMode) => {
            details.changeMode(mode)
            clear()
        },
        [clear, details],
    )

    const actions: AuthActions = {
        submitDetails: (input) => void details.submit(input, code.start),
        submitCode: (input) => void code.submit(input),
        submitFactor: (input) => void twoFactor.submit(input, details.landOnReturnTo),
        resend: () => void code.resend(),
        back: clear,
        changeRememberMe: details.setIsRememberMe,
        changeMode,
        chooseProvider: details.chooseProvider,
        onward: () => {
            if (flow.phase === "notice" || details.mode === "forgotPassword") {
                changeMode("signIn")
                return
            }
            if (flow.phase === "twoFactor") {
                clear()
                return
            }
            details.landOnReturnTo()
        },
        onwardSecondary: () => {
            if (flow.phase === "notice" && notice.noticeKind === "heldAddress") changeMode("forgotPassword")
        },
    }

    const statusMessage = details.providerRefusalVisible ? t("signIn.oauthRefused") : flow.feedback.statusMessage
    const isError = details.providerRefusalVisible || flow.feedback.isError
    const isPending = details.oauthIsMutating || flow.pendingAction !== null
    const panel: AuthenticationPanelProps = {
        ...authenticationPanelFor({
            t,
            mode: details.mode,
            phase: flow.phase,
            noticeKind: notice.noticeKind,
            email: code.email,
            ttlMinutes: code.ttlMinutes,
            cooldownSeconds: code.cooldownSeconds,
            isRememberMe: details.isRememberMe,
            isRestoring,
            isSignedInArrival,
            isPending,
            pendingAction: details.oauthIsMutating ? "provider" : flow.pendingAction,
            pendingProvider: details.pendingProvider,
            statusMessage,
            isError,
        }),
        on: actions,
    }
    const exits = (() => {
        if (isRestoring || isSignedInArrival || flow.phase === "done" || flow.phase === "notice") return []
        const switchTo = details.mode === "signIn" ? "signUp" : "signIn"
        const prompt = {
            question: t(`${details.mode}.promptQuestion`),
            action: t(`${details.mode}.promptAction`),
            onPress: () => changeMode(switchTo),
        }
        if (flow.phase === "twoFactor") return [{ question: "", action: t("signIn.backLabel"), onPress: clear }]
        if (flow.phase === "code") return [{ question: "", action: t("backLabel"), onPress: clear }, prompt]
        return [prompt]
    })()

    return <AuthenticationPageView panel={panel} exits={exits} />
}

/** Keep the live address reader under its required Suspense boundary. */
export const AuthenticationPage = (props: AuthenticationPageProps) => {
    void props
    const t = useTranslations("boundary.loading")
    const [sessionEnding, setSessionEnding] = useState<SessionEndingArrival | null>(null)
    return (
        <Suspense fallback={<RouteLoadingView props={{ label: t("label") }} />}>
            <SessionEndingQuery onParam={setSessionEnding} />
            <AuthenticationPageConnected sessionEnding={sessionEnding} />
        </Suspense>
    )
}
