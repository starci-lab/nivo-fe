import { graphql } from "../graphql"
import type { Outcome } from "../outcome"
import { AUTH_PAYLOAD, BROKERED_PAYLOAD, SIGN_IN_PAYLOAD } from "./documents"
import type { AuthPayload, ContinueBrokeredSignInInput, ContinueBrokeredSignInPayload, ExchangeOauthCodeInput, ExchangeOauthCodePayload, SignInInput, SignInPayload, VerifyTwoFactorInput } from "./types"

/**
 * Exchange an email and password for a session.
 *
 * THE SESSION THIS BROWSER ALREADY HOLDS ENDS THE ATTEMPT FIRST. A browser carrying a current
 * session for the very principal this claim names is answered with that session - no credential is
 * verified, no factor is asked and no attempt is recorded. A browser holding somebody else's session
 * falls through to the proof path, which is where continuing as a different person is decided.
 *
 * @param input - The credentials, this attempt's request identity and the requested destination.
 * @returns The session and where it lands, a two-factor challenge, the undecided result, or why
 *          there is neither.
 */
export const signIn = (input: SignInInput): Promise<Outcome<SignInPayload>> =>
    graphql(
        `mutation SignIn($input: SignInInput!) { signIn(request: $input) { data ${SIGN_IN_PAYLOAD} message success error } }`,
        {
            input,
        },
    )

/**
 * Finish a sign-in that owed a second factor.
 *
 * @param input - The challenge token from the first step, and the code the reader typed.
 * @returns The session, or why the code was refused.
 */
export const verifyTwoFactor = (input: VerifyTwoFactorInput): Promise<Outcome<AuthPayload>> =>
    graphql(
        `mutation VerifyTwoFactor($input: VerifyTwoFactorInput!) { verifyTwoFactor(request: $input) { data ${AUTH_PAYLOAD} message success error } }`,
        {
            input,
        },
    )

/**
 * Trade an OAuth authorization code for a session.
 *
 * THE STATE IS SPENT ONCE. The backend deletes the cached bundle as it reads it, so a second call
 * with the same handle is refused however soon it arrives - which is what stops a code lifted off
 * the callback URL being exchanged a second time.
 *
 * A CALLBACK IS NEVER RESENT, NOT EVEN AFTER AN UNDECIDED ANSWER. An undecided result here is
 * continued with {@link continueBrokeredSignIn} under the reference it carries, or by a fresh
 * provider hand-off when it carries none, because a second exchange is the replay the contract
 * refuses - never a retry.
 *
 * @param input - The code Keycloak returned, the provider it came from, and the handle to spend.
 * @returns The session, a two-factor challenge, the brokered undecided result, the recoverable
 *          provider-email refusal, or why there is none.
 */
export const exchangeOauthCode = (input: ExchangeOauthCodeInput): Promise<Outcome<ExchangeOauthCodePayload>> =>
    graphql(
        `mutation ExchangeOauthCode($input: ExchangeOauthCodeInput!) { exchangeOauthCode(request: $input) { data ${BROKERED_PAYLOAD} message success error } }`,
        {
            input,
        },
    )

/**
 * Repeat only the identity-mapping read of a brokered proof the coordinator is holding.
 *
 * THIS IS HOW A BROKERED UNDECIDED RESULT IS RETRIED, and it must be asked for from the same browser
 * that earned the reference. It carries a one-time, expiring hold rather than a callback, so it is
 * safe to ask again when the authority still does not answer - and its own undecided carries no
 * further reference, because a hold that lapsed released nothing: the person starts a fresh provider
 * sign-in instead of resending anything.
 *
 * @param input - The single-use continuation reference.
 * @returns The session, a two-factor challenge, the undecided result, the provider-email refusal,
 *          or why there is none.
 */
export const continueBrokeredSignIn = (
    input: ContinueBrokeredSignInInput,
): Promise<Outcome<ContinueBrokeredSignInPayload>> =>
    graphql(
        `mutation ContinueBrokeredSignIn($input: ContinueBrokeredSignInInput!) { continueBrokeredSignIn(request: $input) { data ${BROKERED_PAYLOAD} message success error } }`,
        {
            input,
        },
    )

/**
 * Ask for a password reset link.
 *
 * ALWAYS ANSWERS THE SAME WAY on the backend whether or not the email is known, which is why the
 * caller must not turn a `false` into "no such account" - that would rebuild the account-enumeration
 * hole the uniform answer exists to close.
 *
 * @param input - The email to send to.
 * @returns Whether the request was accepted.
 */
