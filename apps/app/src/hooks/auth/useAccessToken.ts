"use client"

import { useSession } from "./useSession"

/**
 * The access token of the signed-in session, or null when no session holds one.
 *
 * ONE HOOK FOR THE ONE QUESTION EVERY AUTHENTICATED READ AND COMMAND ASKS. It is reached as
 * `useAccessToken` from `@/hooks`; a query or a mutation that needs the credential calls it rather
 * than re-deriving it from the session, so the definition of "signed in" has one home.
 *
 * @returns The bearer token, or null while restoring, signed out or ended.
 */
export const useAccessToken = (): string | null => {
    const session = useSession()
    return session.state.status === "signed-in" ? session.state.accessToken : null
}
