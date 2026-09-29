"use client"

import { useCallback, useEffect, useState } from "react"
import type { AuthPendingAction } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthNoticeKind, AuthPhase } from "@/modules/auth/authentication"
import type { AuthenticationFlowControl } from "./auth.shared"

type Progress = {
    readonly code: boolean
    readonly done: boolean
    readonly twoFactor: boolean
}

type UseAuthenticationPhaseOptions = {
    readonly noticeKind: AuthNoticeKind | null
}

/** Share request feedback and derive the visible phase from the active journey facts. */
export const useAuthenticationPhase = ({ noticeKind }: UseAuthenticationPhaseOptions) => {
    const [progress, setProgress] = useState<Progress>({ code: false, done: false, twoFactor: false })
    const [feedback, setFeedback] = useState({ statusMessage: "", isError: false })
    const [pendingAction, setPendingAction] = useState<AuthPendingAction | null>(null)

    const phase: AuthPhase = noticeKind
        ? "notice"
        : progress.twoFactor
          ? "twoFactor"
          : progress.code
            ? "code"
            : progress.done
              ? "done"
              : "details"

    const markCode = useCallback(() => setProgress({ code: true, done: false, twoFactor: false }), [])
    const markDone = useCallback(() => setProgress({ code: false, done: true, twoFactor: false }), [])
    const markTwoFactor = useCallback(() => setProgress({ code: false, done: false, twoFactor: true }), [])
    const resetFlow = useCallback(() => setProgress({ code: false, done: false, twoFactor: false }), [])
    const clearFeedback = useCallback(() => setFeedback({ statusMessage: "", isError: false }), [])
    const refuse = useCallback((statusMessage: string) => setFeedback({ statusMessage, isError: true }), [])
    const hesitate = useCallback((statusMessage: string) => setFeedback({ statusMessage, isError: false }), [])

    const runPending = useCallback(
        async <Answer>(action: AuthPendingAction, request: () => Promise<Answer>): Promise<Answer> => {
            setPendingAction(action)
            try {
                return await request()
            } finally {
                setPendingAction(null)
            }
        },
        [],
    )

    useEffect(() => {
        const releaseRestoredAction = () => setPendingAction(null)
        window.addEventListener("pageshow", releaseRestoredAction)
        return () => window.removeEventListener("pageshow", releaseRestoredAction)
    }, [])

    const control: AuthenticationFlowControl = {
        phase,
        feedback,
        pendingAction,
        markCode,
        markDone,
        markTwoFactor,
        resetFlow,
        clearFeedback,
        refuse,
        hesitate,
        setPendingAction,
        runPending,
    }

    return control
}
