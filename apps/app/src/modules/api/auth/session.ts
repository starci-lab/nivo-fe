import { type EnvelopeAnswer, type Outcome } from "@nivo/api"
import { graphql, graphqlEnvelope } from "../graphql"
import { AUTH_PAYLOAD } from "./documents"
import { parseAuthPayload, parseEndPrincipalSessionsAnswer, parseSignOutEnvelope } from "./guards"
import type { AuthPayload, EndPrincipalSessionsAnswer, EndPrincipalSessionsInput, SignOutInput, SignOutOutcome } from "./types"

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
    graphql(`mutation RefreshSession { refreshSession { data ${AUTH_PAYLOAD} message success error } }`, parseAuthPayload)

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
export const signOut = (input?: SignOutInput): Promise<Outcome<EnvelopeAnswer<boolean, SignOutOutcome>>> =>
    graphqlEnvelope<boolean, SignOutOutcome>(
        "mutation SignOut($input: SignOutInput) { signOut(request: $input) { data remoteRevocationObserved authorityEndingConfirmed message success error } }",
        parseSignOutEnvelope,
        input === undefined ? undefined : { input },
    )

/**
 * End a named principal's Login sessions, once the owner of the stated authority context confirms
 * the requester.
 *
 * THE REQUESTER IS NEVER NAMED HERE. It is taken from the verified access grant, so a caller cannot
 * ask for somebody else's sessions by asserting who they are. `workspaceId` selects WHICH owner
 * confirms - a current Owner or Manager of that workspace, for a current member of it - and the
 * workspace form then aims at the roster `memberId` the requester selected; the owner resolves that
 * member's Login principal, so no principal or email crosses this wire. The server-only
 * Nivo-operation form names the principal instead.
 *
 * ONE SHAPE FOR ALL THREE ANSWERS is the point of this door: `scopeApplied`, `undecided` and
 * `refused` differ only by `kind`, and nothing in the answer says whether the named principal
 * existed, was a member, or had a session anywhere - a refusal reveals no more than an applied scope
 * does. `undecided` is never a refusal: resend the same `requestId` and the same request continues
 * without a second effect.
 *
 * @param input - This request's identity and exactly one authority context with its target.
 * @returns The decided answer, or why there is none.
 */
export const endPrincipalSessions = (input: EndPrincipalSessionsInput): Promise<Outcome<EndPrincipalSessionsAnswer>> =>
    graphql(
        `
            mutation EndPrincipalSessions($input: EndPrincipalSessionsInput!) {
                endPrincipalSessions(request: $input) {
                    data {
                        kind
                        authorityEndingConfirmed
                    }
                    message
                    success
                    error
                }
            }
        `,
        parseEndPrincipalSessionsAnswer,
        {
            input,
        },
    )
