import type {
    AuthPayload,
    EndPrincipalSessionsInput,
    SignOutInput,
    SignOutMutation,
} from "../__generated__/core"

import { type EnvelopeAnswer, type Outcome } from "@nivo/api"
import { EndPrincipalSessionsDocument, RefreshSessionDocument, SignOutDocument } from "../__generated__/core"
import { graphql, graphqlEnvelope } from "../graphql"
import { parseAuthPayload, parseEndPrincipalSessionsDecision, parseSignOutEnvelope } from "./guards"

/**
 * Trade the HttpOnly refresh cookie for a fresh access token.
 *
 * TAKES NO ARGUMENT ON PURPOSE. The credential is the cookie, which the browser attaches; an argument
 * here would imply the refresh token is something this code holds, and the whole design is that it is
 * not.
 *
 * @returns A fresh session, or why there is none.
 */
export const refreshSession = (): Promise<Outcome<AuthPayload>> =>
    graphql(RefreshSessionDocument, parseAuthPayload)

/**
 * End a named principal's Login sessions under the supplied authority context.
 *
 * The workspace flow supplies the workspace and roster member; a Nivo operation supplies the
 * principal. The adapter uses the generated schema input directly, whose nullable fields do not
 * encode that choice as a one-of constraint.
 *
 * @param input - The request identity, target and authority context.
 * @returns The applied scope, an undecided answer, a generic refusal, or why there is none.
 */
export const endPrincipalSessions = (
    input: EndPrincipalSessionsInput,
) => graphql(EndPrincipalSessionsDocument, parseEndPrincipalSessionsDecision, { input })

/**
 * End this browser's session, or every session of the signed-in principal.
 *
 * `data` MEANS THE REQUEST COMPLETED, NOT THAT REVOCATION WAS OBSERVED, and this adapter no longer
 * loses the answers that tell the two apart. The resolver states them as siblings of `data` - whether
 * the provider's best-effort revoke was observed, and whether an everywhere scope was confirmed by
 * the identity authority - so the request goes through the envelope-stating transport
 * ({@link graphqlEnvelope}) and the caller reads both instead of guessing them from a completed
 * request. A caller must still never present a completed this-browser sign-out as a revocation
 * everywhere: `authorityEndingConfirmed` is null there because nothing principal-wide was asked.
 *
 * @param input - The ending scope; omitted means this browser.
 * @returns The completed request and the two answers stated beside it, or why there is none.
 */
export const signOut = (
    input?: SignOutInput,
): Promise<
    Outcome<
        EnvelopeAnswer<
            boolean,
            Pick<SignOutMutation["signOut"], "remoteRevocationObserved" | "authorityEndingConfirmed">
        >
    >
> =>
    graphqlEnvelope<
        boolean,
        Pick<SignOutMutation["signOut"], "remoteRevocationObserved" | "authorityEndingConfirmed">
    >(
        SignOutDocument,
        parseSignOutEnvelope,
        input === undefined ? undefined : { input },
    )
