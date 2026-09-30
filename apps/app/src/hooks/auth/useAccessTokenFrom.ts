
import { type TokenReader } from "@nivo/api"
import { setAccessTokenReader } from "@/modules/api/graphql"

/**
 * Point the GraphQL transport at the reader that answers with the access token in force.
 *
 * The transport owns the reader because it is the thing that puts the token on the wire, but only a
 * component knows where the session keeps the token. This hook is how the two are bound from a
 * component, reached as `useAccessTokenFrom` from `@/hooks/auth` - a component may not import the
 * transport's setter itself. A `modules/` owner such as the session store calls
 * {@link setAccessTokenReader} directly instead, because a module may not reach the hooks root.
 *
 * Pass a stable reader - one `useCallback`, or a ref-backed one. The transport reads it during a
 * fetch rather than during a render, so a reader rebuilt every render would leave the binding
 * pointing at whichever closure was installed last.
 *
 * @param reader - Answers with the token in force right now, or null when signed out.
 */
export const useAccessTokenFrom = (reader: TokenReader) => {
    setAccessTokenReader(reader)
}
