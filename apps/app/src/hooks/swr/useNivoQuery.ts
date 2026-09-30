import { useEffect } from "react"
import useSWR, { type SWRConfiguration, type SWRResponse } from "swr"
import { useAccessToken } from "../auth/useAccessToken"
import { useSession } from "../auth/useSession"
import { nivoViewerQueryKeyFor, type NivoQueryKey, type NivoViewerQueryKey } from "./swr.shared"

/** One settled answer that says the credential itself was refused: the session's claim is over. */
const isRefusedAnswer = (value: unknown): boolean =>
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === false &&
    "kind" in value &&
    value.kind === "refused"

/**
 * Own one authenticated server read. Components receive the transport's explicit `Outcome<T>` and
 * therefore keep operation refusal distinct from loading and from an unexpected thrown failure.
 *
 * A `refused` answer is the server declining the session itself: the session is discarded here, so
 * every read stops at once and the console's own anonymous redirect walks the reader to sign-in.
 * The answer still reaches its caller, which draws the refused kind like any other.
 */
export const useNivoQuery = <TAnswer>(
    queryKey: NivoQueryKey | null,
    query: () => Promise<TAnswer>,
    config?: SWRConfiguration<TAnswer, Error>,
): SWRResponse<TAnswer, Error> => {
    const accessToken = useAccessToken()
    const session = useSession()
    const key: NivoViewerQueryKey | null =
        accessToken !== null && accessToken.length > 0 && queryKey !== null ? nivoViewerQueryKeyFor(accessToken, queryKey) : null
    const response = useSWR<TAnswer, Error>(key, query, {
        revalidateOnFocus: true,
        ...config,
    })
    const answer = response.data
    useEffect(() => {
        if (session.state.status === "signed-in" && isRefusedAnswer(answer)) session.discard()
    }, [answer, session])
    return response
}
