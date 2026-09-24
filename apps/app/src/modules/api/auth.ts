import { graphql, type Result } from "./graphql";

/**
 * Every authentication operation nivo-core publishes, typed once.
 *
 * THE DOCUMENTS ARE WRITTEN OUT rather than generated. They change when the backend changes, and a
 * codegen step would put a build tool between a reader and the exact fields this app asks for. When
 * the console's read queries land and the count passes a few dozen, that trade flips.
 *
 * WHAT `AuthPayload` MEANS, because it is the shape everything here returns. A successful password
 * sign-in answers `{ accessToken, requiresTwoFactor: false, twoFactorToken: null }`. An account with
 * a second factor answers `{ accessToken: null, requiresTwoFactor: true, twoFactorToken: "..." }` -
 * NOT an error. The caller must read `requiresTwoFactor` before it reads `accessToken`, because a
 * null token there is a challenge rather than a refusal.
 *
 * TWO FURTHER ANSWERS ARE NOT SESSIONS EITHER, and the payloads below carry them beside those three
 * fields. An UNDECIDED result says an authority did not answer: nothing was refused, the person is
 * told "could not complete this - try again", and the same request identity continues the attempt.
 * A brokered callback is one-time, so its undecided carries a continuation reference to present to
 * `continueBrokeredSignIn` - or null, when no proof could be held and a fresh provider sign-in is
 * the way on. A CONCLUSION is a deliberate finish with no session - the proven address is already
 * held, or the identity was created but no session followed - and its reason is the whole
 * instruction for what the screen offers next.
 *
 * THE REFRESH TOKEN IS ABSENT FROM EVERY TYPE HERE, deliberately. It never crosses into JavaScript:
 * the backend writes it as an HttpOnly cookie and the browser carries it. A field for it would be a
 * field that is always undefined, and the first person to try filling it would move the token into
 * script-readable storage.
 */

/** What the backend answers to every credential exchange. */
export interface AuthPayload {
  /** The Bearer credential, or null while a second factor is still owed. */
  readonly accessToken: string | null;
  /** Whether a TOTP code is required to finish this sign-in. */
  readonly requiresTwoFactor: boolean;
  /** The opaque challenge to hand back to `verifyTwoFactor`; present only with the flag above. */
  readonly twoFactorToken: string | null;
}

/**
 * An authority did not answer, so Nivo could not decide.
 *
 * IT IS NOT A REFUSAL, and reporting it as one is the mistake this shape exists to prevent: a
 * refusal says the person's credential was wrong, while this says Nivo never found out. No token,
 * no destination and no reason travel with it, and `retryWithSameRequest` is the transport telling
 * the caller that resending the same request identity continues the attempt rather than starting a
 * second one.
 */
export interface AuthUndecided {
  /** Always true: the same request identity continues the same request. */
  readonly retryWithSameRequest: boolean;
}

/**
 * A brokered sign-in the provider answered but an authority could not finish.
 *
 * THE REFERENCE IS A CONTINUATION, NOT A CREDENTIAL. Present it to
 * {@link continueBrokeredSignIn} to repeat only the identity-mapping read of the proof the
 * coordinator is holding; it is single-use and expires with its hold. When it is null - the token
 * exchange did not answer, or the hold lapsed - there is nothing to continue with, and a fresh
 * provider hand-off is the way on. A callback must never be resent instead: it was consumed.
 */
export interface AuthBrokeredUndecided {
  /** The handle for `continueBrokeredSignIn` from this browser, or null for a fresh provider start. */
  readonly continuationReference: string | null;
}

/** Why a Login operation finished on purpose without issuing a session. */
export type AuthConclusionReason =
  /** The proven address already has an identity: sign in, or reset the password. */
  | "heldAddress"
  /** The identity was created but no session followed: sign in with the password just set. */
  | "registeredSignInRequired"
  /** The password changed and no session follows a reset: sign in with the new password. */
  | "passwordResetConfirmed";

/** A deliberate ending with no session, whose reason is what the screen offers next. */
export interface AuthConclusion {
  /** Why no session was issued. */
  readonly reason: AuthConclusionReason;
}

/**
 * What a password sign-in answers.
 *
 * `destination` is the ONE internal place this session lands, decided by the backend from the
 * requested destination only once a session is current - already folded onto the default
 * authenticated landing surface when the request was absent, malformed, protocol-relative, external
 * or out of reach. It is null while a factor is owed or the result is undecided, because no
 * destination is resolved for an attempt that established nothing.
 */
export interface SignInPayload extends AuthPayload {
  /** Where to place the reader, resolved server-side; null when no session was established. */
  readonly destination: string | null;
  /** Present only when an authority did not answer; never a refusal. */
  readonly undecided: AuthUndecided | null;
}

/**
 * What spending a sign-up code answers.
 *
 * A session is only one of three endings. `conclusion` is the deliberate no-session ending - the
 * proven address already has an identity, or the identity was created and no session followed - and
 * it is the only place that says which, so a caller that read `accessToken` alone would show a
 * blank success to somebody who is not signed in.
 */
export interface SignUpVerifyOtpPayload extends AuthPayload {
  /** Present only when registration ended without a session; its reason says what to offer next. */
  readonly conclusion: AuthConclusion | null;
  /** Present only when an authority did not answer; never a refusal. */
  readonly undecided: AuthUndecided | null;
}

/**
 * What trading a provider callback answers.
 *
 * `undecided` here is the BROKERED shape, because the callback it came from has already been spent:
 * the retry is a continuation, not a resend. `providerEmailRefused` is a value rather than the
 * generic refusal, because the door must be able to say that this subject carried no verified email
 * and no identity was linked - the person is then offered password registration or sign-in.
 */
export interface ExchangeOauthCodePayload extends AuthPayload {
  /** Present only when an authority did not answer; continue under its reference, or start fresh. */
  readonly undecided: AuthBrokeredUndecided | null;
  /** Present only for an unbound subject with no verified email; no identity link, no session. */
  readonly providerEmailRefused: boolean | null;
}

/**
 * What repeating a held brokered proof answers.
 *
 * Its undecided is the PLAIN one, not the brokered one: a hold that lapsed releases nothing, so a
 * continuation never hands back another continuation - the person starts a fresh provider sign-in.
 */
export interface ContinueBrokeredSignInPayload extends AuthPayload {
  /** Present only when the authority still did not answer or the hold lapsed; never a refusal. */
  readonly undecided: AuthUndecided | null;
  /** Present only for a held subject with no verified email; no identity link, no session. */
  readonly providerEmailRefused: boolean | null;
}

/**
 * What a mailed-code journey answers to its first step, and to a resend.
 *
 * `challengeId` IS THE WHOLE STATE. It is what the second step spends, what a resend renews, and the
 * only thing tying two requests into one journey - so a screen that loses it has lost the journey and
 * must start over rather than guess.
 */
export interface OtpChallenge {
  /** The opaque handle to spend at the second step. */
  readonly challengeId: string;
  /** How long the code lasts, in seconds, as the backend reports it. */
  readonly expiresInSeconds: number;
}

/** What opening a code-gated account asks for. */
export interface SignUpInitInput {
  /** The address the account is keyed on, and where the code is sent. */
  readonly email: string;
  /** The password as typed. `@MinLength(8)` refuses anything shorter BEFORE a code is sent. */
  readonly password: string;
  /** A display name, when the reader gave one. */
  readonly name?: string;
}

/** What spending a sign-up code asks for. */
export interface SignUpVerifyOtpInput {
  /** The challenge from the first step. */
  readonly challengeId: string;
  /** The code out of the inbox. */
  readonly otp: string;
}

/** What asking for a reset code needs. */
export interface ForgotPasswordInitInput {
  /** The address as typed. */
  readonly email: string;
}

/** What spending a reset code needs. */
export interface ForgotPasswordVerifyOtpInput {
  /** The challenge from the first step. */
  readonly challengeId: string;
  /** The code out of the inbox. */
  readonly otp: string;
  /** The password to set. Spent and set in ONE request, which is why they travel together. */
  readonly newPassword: string;
}

/** What renewing a code needs, on either journey. */
export interface OtpResendInput {
  /** The challenge to renew. */
  readonly challengeId: string;
}

/** What exchanging credentials asks for. */
export interface SignInInput {
  /** The address. */
  readonly email: string;
  /** The password as typed. */
  readonly password: string;
  /**
   * This ONE logical attempt's stable identity.
   *
   * A RETRY, A TIMEOUT AND A LOST RESPONSE MUST RESEND THE SAME VALUE. The backend answers a repeat
   * from the first result rather than deciding again, which is what stops a slow sign-in from
   * becoming two attempts - so the caller mints it once per submit and keeps it until the outcome
   * is settled. Omitted, the backend mints a fresh single-use one per request.
   */
  readonly requestIdentity?: string;
  /**
   * Where the reader asked to be placed, taken from the query and NEVER trusted.
   *
   * It travels to the backend rather than being followed here, because a destination may only be
   * resolved after a session is current: the answer says where to land, and an absent, malformed,
   * protocol-relative, external or unreachable value is folded onto the default authenticated
   * landing surface without being echoed. It is discarded for a refused or undecided attempt.
   */
  readonly requestedDestination?: string;
}

/** What repeating a held brokered proof asks for. */
export interface ContinueBrokeredSignInInput {
  /** The single-use reference the undecided brokered result carried. */
  readonly continuationReference: string;
}

/** How wide one sign-out reaches. */
export type SignOutScope =
  /** This browser's custody and in-memory access only. */
  | "thisBrowser"
  /** Every current session of the signed-in principal, in every browser. */
  | "everywhere";

/** What ending a session asks for. */
export interface SignOutInput {
  /** The ending scope; omitted means this browser. The requester is never named here. */
  readonly scope?: SignOutScope;
}

/** What ending another principal's sessions asks for. */
export interface EndPrincipalSessionsInput {
  /** This one logical ending request's stable identity; resend it unchanged on retry. */
  readonly requestId: string;
  /** The Login principal whose sessions would end. */
  readonly targetPrincipal: string;
  /** The workspace the requester administers; omitted to ask as Nivo operation. */
  readonly workspaceId?: string;
}

/** Which of the three decided answers an ending request produced. */
export type EndPrincipalSessionsKind =
  /** The asked scope was applied. */
  | "scopeApplied"
  /** An authority did not answer; the same request identity continues it. Never a refusal. */
  | "undecided"
  /** The generic refusal, in the same terms every refusal uses. */
  | "refused";

/**
 * One decided administrator session-ending answer.
 *
 * ONE SHAPE CARRIES ALL THREE ANSWERS on purpose: an unknown principal, a non-member, an
 * unauthorized requester and a principal with nothing current are indistinguishable but for `kind`,
 * so the caller learns nothing about principal existence, membership or session presence.
 * `authorityEndingConfirmed` speaks only for the applied scope and is null for the other two.
 */
export interface EndPrincipalSessionsAnswer {
  /** Which answer this is. */
  readonly kind: EndPrincipalSessionsKind;
  /** For the applied scope, whether the identity authority confirmed its own side; else null. */
  readonly authorityEndingConfirmed: boolean | null;
}

/** What finishing a two-factor sign-in asks for. */
export interface VerifyTwoFactorInput {
  /** The challenge handed back by the first step. */
  readonly twoFactorToken: string;
  /** The code the reader read off their authenticator. */
  readonly code: string;
}

/**
 * Which identity provider a shortcut hands off to.
 *
 * The value travels exactly as spelled here: it is the Keycloak identity-provider alias, and the
 * backend puts it straight on the authorization URL as `kc_idp_hint`.
 */
export type OauthProvider = "google" | "github";

/**
 * What trading an OAuth authorization code asks for.
 *
 * NO VERIFIER, AND THAT IS THE WHOLE DESIGN. PKCE exists so that an intercepted authorization code
 * is useless without the verifier that was hashed into the challenge - so a verifier this browser
 * held and posted back would be a verifier anything able to read this page could hold too. The
 * backend generates it, caches it against {@link state}, and never sends it here. What crosses the
 * wire is an opaque handle that the backend spends once.
 */
export interface ExchangeOauthCodeInput {
  /** The code Keycloak put on the callback URL. */
  readonly code: string;
  /** Which door the hand-off went through; the backend refuses a bundle cached for another one. */
  readonly provider: OauthProvider;
  /** The opaque handle the redirect endpoint issued, and the only state this browser carries. */
  readonly state: string;
}

/** What asking for a reset link needs. */
export interface RequestPasswordResetInput {
  /** Where to send it. */
  readonly email: string;
}

/** What spending a reset link needs. */
export interface ResetPasswordInput {
  /** The token out of the link. */
  readonly token: string;
  /** The password to set. */
  readonly newPassword: string;
}

/**
 * Where the core API answers, read the same way `graphql.ts` reads it.
 *
 * ONE VARIABLE, DELIBERATELY. The hand-off leaves for the API's own ORIGIN rather than for its
 * GraphQL path, so it needs the host on its own - but a second variable naming that host would be a
 * second thing that can be wrong, and what it buys is a build whose queries reach production while
 * its sign-in reaches a laptop. So this reads the same variable with the same fallback.
 *
 * THE REPEATED LITERAL IS A COST, NOT A CHOICE. `graphql.ts` keeps its endpoint module-private, so
 * there is nothing to import; the smaller shape is that file exporting the value and this one
 * reading it, and that file is not this change's to edit.
 */
const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql";

/**
 * Where a provider hand-off starts.
 *
 * IT IS A NAVIGATION, NOT A REQUEST. The endpoint answers 302 towards Keycloak, and only a top-level
 * navigation may follow that - fetched, the browser would chase the redirect itself as a
 * cross-origin request and the reader would never leave this page.
 *
 * NOTHING SECRET IS BUILT HERE. The verifier and the state are the backend's; this browser hands
 * over one thing, the address it wants the reader returned to.
 *
 * @param provider - Which identity provider to hand off to.
 * @param redirectUri - The page Keycloak returns the reader to. Passed raw, because the backend both
 * forwards it and replays it at the token exchange, and those two must be the same string.
 * @returns The absolute URL to navigate to.
 */
export const oauthRedirectUrl = (provider: OauthProvider, redirectUri: string): string => {
  /*
   * An ABSOLUTE path against the endpoint, so the whole path is replaced rather than appended.
   * `CORE_API_URL` ends in `/graphql`, and concatenating would aim the hand-off at
   * `/graphql/api/v1/...` - a 404 that looks like a broken provider rather than a broken URL.
   */
  const url = new URL(`/api/v1/keycloak/${provider}/redirect`, CORE_API_URL);
  url.searchParams.set("redirect_uri", redirectUri);
  return url.toString();
};

/** The fields every payload-returning operation selects. */
const AUTH_PAYLOAD = "{ accessToken requiresTwoFactor twoFactorToken }";

/**
 * A sign-in's session, plus the one place it lands and the undecided result.
 *
 * `undecided` is an object rather than a scalar, so it is selected through its one field; GraphQL
 * answers null for the whole object when there is nothing to say, which is exactly the shape
 * {@link SignInPayload} types.
 */
const SIGN_IN_PAYLOAD = "{ accessToken requiresTwoFactor twoFactorToken destination undecided { retryWithSameRequest } }";

/** A brokered completion or continuation: a session, its undecided result and the email refusal. */
const BROKERED_PAYLOAD = "{ accessToken requiresTwoFactor twoFactorToken providerEmailRefused undecided { continuationReference } }";

/** A registration completion: a session, its deliberate conclusion and the undecided result. */
const SIGN_UP_VERIFY_PAYLOAD = "{ accessToken requiresTwoFactor twoFactorToken conclusion { reason } undecided { retryWithSameRequest } }";

/** The fields every challenge-returning operation selects. */
const OTP_CHALLENGE = "{ challengeId expiresInSeconds }";

/**
 * Open an account behind a mailed code.
 *
 * NOTHING IS CREATED HERE. The account does not exist until the code comes back, which is why an
 * address that is already registered is NOT refused at this step - the 409 arrives at verify, after
 * the code has been spent. Two requests, and the failure lands on the second one.
 *
 * @param input - The email, the password and an optional display name.
 * @returns The challenge, or why there is none.
 */
export const signUpInit = (input: SignUpInitInput): Promise<Result<OtpChallenge>> => graphql(`mutation SignUpInit($input: SignUpInitInput!) { signUpInit(input: $input) { data ${OTP_CHALLENGE} message success error } }`, {
  input
});

/**
 * Send another sign-up code.
 *
 * REFUSED INSIDE SIXTY SECONDS with `OTP_RESEND_TOO_SOON_EXCEPTION`, which is a real rate limit
 * rather than a courtesy - the caller must not press this on a timer.
 *
 * @param input - The challenge to renew.
 * @returns The renewed challenge, or why it was refused.
 */
export const signUpResend = (input: OtpResendInput): Promise<Result<OtpChallenge>> => graphql(`mutation SignUpResend($input: SignUpResendInput!) { signUpResend(input: $input) { data ${OTP_CHALLENGE} message success error } }`, {
  input
});

/**
 * Spend a sign-up code, which is what actually creates the account.
 *
 * THE PROOF AND THE UNIQUENESS CHECK ARE BOTH ATOMIC HERE, so this is where a PROVEN address that
 * already has an identity ends - and it ends as a conclusion, never a refusal: the code was good,
 * the mailbox was proved, and only then does the authoritative check find the address held. It is
 * also where an identity created without a session ends, offering the password just set.
 *
 * @param input - The challenge and the code.
 * @returns The session, the conclusion, the undecided result, or why the code was refused.
 */
export const signUpVerifyOtp = (input: SignUpVerifyOtpInput): Promise<Result<SignUpVerifyOtpPayload>> => graphql(`mutation SignUpVerifyOtp($input: SignUpVerifyOtpInput!) { signUpVerifyOtp(input: $input) { data ${SIGN_UP_VERIFY_PAYLOAD} message success error } }`, {
  input
});

/**
 * Ask for a reset code.
 *
 * ANSWERS AN UNKNOWN ADDRESS EXACTLY AS IT ANSWERS A KNOWN ONE - same flag, same sentence, same
 * lifetime, and a code mailed either way. The caller must NOT turn any part of this answer into
 * "no such account": that symmetry is the only thing stopping this endpoint being used to ask, one
 * address at a time, who has an account here.
 *
 * @param input - The address as typed.
 * @returns The challenge.
 */
export const forgotPasswordInit = (input: ForgotPasswordInitInput): Promise<Result<OtpChallenge>> => graphql(`mutation ForgotPasswordInit($input: ForgotPasswordInitInput!) { forgotPasswordInit(input: $input) { data ${OTP_CHALLENGE} message success error } }`, {
  input
});

/**
 * Send another reset code.
 *
 * @param input - The challenge to renew.
 * @returns The renewed challenge, or why it was refused.
 */
export const forgotPasswordResend = (input: OtpResendInput): Promise<Result<OtpChallenge>> => graphql(`mutation ForgotPasswordResend($input: ForgotPasswordResendInput!) { forgotPasswordResend(input: $input) { data ${OTP_CHALLENGE} message success error } }`, {
  input
});

/**
 * Spend a reset code and set the password, in one request.
 *
 * RETURNS A BOOLEAN, NOT A SESSION, and the difference is the whole design: setting a password is not
 * signing in. A caller that adopted something here would be adopting nothing.
 *
 * IT REFUSES AT THE VERY END for an address nobody has, wearing the same words an expired challenge
 * wears. Reporting those two differently would hand an inbox holder the answer the journey withholds.
 *
 * @param input - The challenge, the code and the password to set.
 * @returns Whether the password was set.
 */
export const forgotPasswordVerifyOtp = (input: ForgotPasswordVerifyOtpInput): Promise<Result<boolean>> => graphql(`mutation ForgotPasswordVerifyOtp($input: ForgotPasswordVerifyOtpInput!) { forgotPasswordVerifyOtp(input: $input) { data message success error } }`, {
  input
});

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
export const signIn = (input: SignInInput): Promise<Result<SignInPayload>> => graphql(`mutation SignIn($input: SignInInput!) { signIn(input: $input) { data ${SIGN_IN_PAYLOAD} message success error } }`, {
  input
});

/**
 * Finish a sign-in that owed a second factor.
 *
 * @param input - The challenge token from the first step, and the code the reader typed.
 * @returns The session, or why the code was refused.
 */
export const verifyTwoFactor = (input: VerifyTwoFactorInput): Promise<Result<AuthPayload>> => graphql(`mutation VerifyTwoFactor($input: VerifyTwoFactorInput!) { verifyTwoFactor(input: $input) { data ${AUTH_PAYLOAD} message success error } }`, {
  input
});

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
export const exchangeOauthCode = (input: ExchangeOauthCodeInput): Promise<Result<ExchangeOauthCodePayload>> => graphql(`mutation ExchangeOauthCode($input: ExchangeOauthCodeInput!) { exchangeOauthCode(input: $input) { data ${BROKERED_PAYLOAD} message success error } }`, {
  input
});

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
export const continueBrokeredSignIn = (input: ContinueBrokeredSignInInput): Promise<Result<ContinueBrokeredSignInPayload>> => graphql(`mutation ContinueBrokeredSignIn($input: ContinueBrokeredSignInInput!) { continueBrokeredSignIn(input: $input) { data ${BROKERED_PAYLOAD} message success error } }`, {
  input
});

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
export const requestPasswordReset = (input: RequestPasswordResetInput): Promise<Result<boolean>> => graphql(`mutation RequestPasswordReset($input: RequestPasswordResetInput!) { requestPasswordReset(input: $input) { data message success error } }`, {
  input
});

/**
 * Set a new password from a reset link.
 *
 * @param input - The token out of the link, and the new password.
 * @returns Whether it was accepted.
 */
export const resetPassword = (input: ResetPasswordInput): Promise<Result<boolean>> => graphql(`mutation ResetPassword($input: ResetPasswordInput!) { resetPassword(input: $input) { data message success error } }`, {
  input
});

/**
 * Trade the HttpOnly refresh cookie for a fresh access token.
 *
 * TAKES NO ARGUMENT ON PURPOSE. The credential is the cookie, which the browser attaches; an argument
 * here would imply the refresh token is something this code holds, and the whole design is that it is
 * not.
 *
 * @returns A fresh session, or why there is none.
 */
export const refreshSession = (): Promise<Result<AuthPayload>> => graphql(`mutation RefreshSession { refreshSession { data ${AUTH_PAYLOAD} message success error } }`);

/**
 * End this browser's session, or every session of the signed-in principal.
 *
 * `data` MEANS THE REQUEST COMPLETED, NOT THAT REVOCATION WAS OBSERVED - and that gap is real here
 * rather than philosophical. The resolver answers `true` whatever the provider's best-effort revoke
 * did, and it states whether revocation was observed and whether an everywhere scope was confirmed
 * by the identity authority as SIBLINGS of `data`; the transport in `graphql.ts` unwraps `data` and
 * carries neither, so this adapter can only answer that the request completed. A caller must
 * therefore report local completion and an unknown remote outcome, never a revocation everywhere.
 *
 * @param input - The ending scope; omitted means this browser.
 * @returns Whether the server completed the request.
 */
export const signOut = (input?: SignOutInput): Promise<Result<boolean>> => graphql("mutation SignOut($input: SignOutInput) { signOut(input: $input) { data message success error } }", input === undefined ? undefined : { input });

/**
 * End a named principal's Login sessions, once the owner of the stated authority context confirms
 * the requester.
 *
 * THE REQUESTER IS NEVER NAMED HERE. It is taken from the verified access grant, so a caller cannot
 * ask for somebody else's sessions by asserting who they are. `workspaceId` selects WHICH owner
 * confirms - a current Owner or Manager of that workspace, for a current member of it - while
 * omitting it asks as Nivo operation.
 *
 * ONE SHAPE FOR ALL THREE ANSWERS is the point of this door: `scopeApplied`, `undecided` and
 * `refused` differ only by `kind`, and nothing in the answer says whether the named principal
 * existed, was a member, or had a session anywhere - a refusal reveals no more than an applied scope
 * does. `undecided` is never a refusal: resend the same `requestId` and the same request continues
 * without a second effect.
 *
 * @param input - This request's identity, the named principal and the authority context.
 * @returns The decided answer, or why there is none.
 */
export const endPrincipalSessions = (input: EndPrincipalSessionsInput): Promise<Result<EndPrincipalSessionsAnswer>> => graphql(`mutation EndPrincipalSessions($input: EndPrincipalSessionsInput!) { endPrincipalSessions(input: $input) { data { kind authorityEndingConfirmed } message success error } }`, {
  input
});
