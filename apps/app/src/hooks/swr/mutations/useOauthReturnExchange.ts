import { useState } from "react"
import useSWRImmutable from "swr/immutable"
import { exchangeOauthCode } from "@/modules/api/auth"
import { takeOauthProvider } from "@/modules/auth"
import { useAuthMutation } from "../useAuthMutation"

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

type OauthReturnAnswer = Awaited<ReturnType<typeof exchangeOauthCode>>

/** What the provider left in the address when it sent the reader back. */
type OauthReturn = {
    readonly code: string | null
    readonly state: string | null
}
