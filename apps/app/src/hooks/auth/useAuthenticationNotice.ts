
import { useCallback, useEffect, useRef, useState } from "react"
import { sessionEndingNotice, type AuthNoticeKind, type SessionEndingArrival } from "@/modules/auth/authentication"

type AuthenticationRouter = { readonly replace: (path: string) => unknown }

type UseAuthenticationNoticeOptions = {
    readonly sessionEnding: SessionEndingArrival | null
    readonly pathname: string
    readonly router: AuthenticationRouter
}

/** Hold deliberate no-session endings and consume the live session-ending address once. */
export const useAuthenticationNotice = ({ sessionEnding, pathname, router }: UseAuthenticationNoticeOptions) => {
    const [localNotice, setLocalNotice] = useState<AuthNoticeKind | null>(null)
    const [sessionEndingDismissed, setSessionEndingDismissed] = useState(false)
    const hasConsumedSessionEnding = useRef(false)

    useEffect(() => {
        if (!sessionEnding?.handedOff || hasConsumedSessionEnding.current) return
        hasConsumedSessionEnding.current = true
        const query = sessionEnding.rest === "" ? "" : `?${sessionEnding.rest}`
        router.replace(`${pathname}${query}`)
    }, [pathname, router, sessionEnding])

    const show = useCallback((notice: AuthNoticeKind) => setLocalNotice(notice), [])
    const clear = useCallback(() => {
        setLocalNotice(null)
        if (sessionEnding?.handedOff) setSessionEndingDismissed(true)
    }, [sessionEnding])
    const noticeKind = localNotice ?? (sessionEndingDismissed ? null : sessionEndingNotice(sessionEnding))

    return { noticeKind, show, clear }
}
