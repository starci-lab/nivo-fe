
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

export interface AuthPayload {
    /** The Bearer credential, or null while a second factor is still owed. */
    readonly accessToken: string | null
    /** Whether a TOTP code is required to finish this sign-in. */
    readonly requiresTwoFactor: boolean
    /** The opaque challenge to hand back to `verifyTwoFactor`; present only with the flag above. */
    readonly twoFactorToken: string | null
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
    readonly retryWithSameRequest: boolean
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
    readonly continuationReference: string | null
}

/** Why a Login operation finished on purpose without issuing a session. */
export type AuthConclusionReason =
    /** The proven address already has an identity: sign in, or reset the password. */
    | "heldAddress"
    /** The identity was created but no session followed: sign in with the password just set. */
    | "registeredSignInRequired"
    /** The password changed and no session follows a reset: sign in with the new password. */
    | "passwordResetConfirmed"

/** A deliberate ending with no session, whose reason is what the screen offers next. */
export interface AuthConclusion {
    /** Why no session was issued. */
    readonly reason: AuthConclusionReason
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
    readonly destination: string | null
    /** Present only when an authority did not answer; never a refusal. */
    readonly undecided: AuthUndecided | null
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
    readonly conclusion: AuthConclusion | null
    /** Present only when an authority did not answer; never a refusal. */
    readonly undecided: AuthUndecided | null
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
    readonly undecided: AuthBrokeredUndecided | null
    /** Present only for an unbound subject with no verified email; no identity link, no session. */
    readonly providerEmailRefused: boolean | null
}

/**
 * What repeating a held brokered proof answers.
 *
 * Its undecided is the PLAIN one, not the brokered one: a hold that lapsed releases nothing, so a
 * continuation never hands back another continuation - the person starts a fresh provider sign-in.
 */
export interface ContinueBrokeredSignInPayload extends AuthPayload {
    /** Present only when the authority still did not answer or the hold lapsed; never a refusal. */
    readonly undecided: AuthUndecided | null
    /** Present only for a held subject with no verified email; no identity link, no session. */
    readonly providerEmailRefused: boolean | null
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
    readonly challengeId: string
    /** How long the code lasts, in seconds, as the backend reports it. */
    readonly expiresInSeconds: number
}

/** What opening a code-gated account asks for. */
export interface SignUpInitInput {
    /** The address the account is keyed on, and where the code is sent. */
    readonly email: string
    /** The password as typed. `@MinLength(8)` refuses anything shorter BEFORE a code is sent. */
    readonly password: string
    /** A display name, when the reader gave one. */
    readonly name?: string
}

/** What spending a sign-up code asks for. */
export interface SignUpVerifyOtpInput {
    /** The challenge from the first step. */
    readonly challengeId: string
    /** The code out of the inbox. */
    readonly otp: string
}

/** What asking for a reset code needs. */
export interface ForgotPasswordInitInput {
    /** The address as typed. */
    readonly email: string
}

/** What spending a reset code needs. */
export interface ForgotPasswordVerifyOtpInput {
    /** The challenge from the first step. */
    readonly challengeId: string
    /** The code out of the inbox. */
    readonly otp: string
    /** The password to set. Spent and set in ONE request, which is why they travel together. */
    readonly newPassword: string
}

/** What renewing a code needs, on either journey. */
export interface OtpResendInput {
    /** The challenge to renew. */
    readonly challengeId: string
}

/** What exchanging credentials asks for. */
export interface SignInInput {
    /** The address. */
    readonly email: string
    /** The password as typed. */
    readonly password: string
    /**
     * This ONE logical attempt's stable identity.
     *
     * A RETRY, A TIMEOUT AND A LOST RESPONSE MUST RESEND THE SAME VALUE. The backend answers a repeat
     * from the first result rather than deciding again, which is what stops a slow sign-in from
     * becoming two attempts - so the caller mints it once per submit and keeps it until the outcome
     * is settled. Omitted, the backend mints a fresh single-use one per request.
     */
    readonly requestIdentity?: string
    /**
     * Where the reader asked to be placed, taken from the query and NEVER trusted.
     *
     * It travels to the backend rather than being followed here, because a destination may only be
     * resolved after a session is current: the answer says where to land, and an absent, malformed,
     * protocol-relative, external or unreachable value is folded onto the default authenticated
     * landing surface without being echoed. It is discarded for a refused or undecided attempt.
     */
    readonly requestedDestination?: string
}

/** What repeating a held brokered proof asks for. */
export interface ContinueBrokeredSignInInput {
    /** The single-use reference the undecided brokered result carried. */
    readonly continuationReference: string
}

/** How wide one sign-out reaches. */
export type SignOutScope =
    /** This browser's custody and in-memory access only. */
    | "thisBrowser"
    /** Every current session of the signed-in principal, in every browser. */
    | "everywhere"

/** What ending a session asks for. */
export interface SignOutInput {
    /** The ending scope; omitted means this browser. The requester is never named here. */
    readonly scope?: SignOutScope
}

/**
 * What the sign-out envelope states beside its payload.
 *
 * `data` ALONE IS NOT THE ANSWER. It says the request completed - the resolver clears the local
 * refresh cookie whether or not the provider's best-effort revoke did anything - and the two answers
 * that tell completion apart from a revocation are built into the envelope itself, because the
 * transform interceptor can only fill `data` and reporting either inside it would misstate it.
 *
 * BOTH ARE READ AS WRITTEN, never improved. `remoteRevocationObserved` is `false` while the provider's
 * outcome is unobserved, which is the common case; `authorityEndingConfirmed` is `null` for a
 * this-browser scope, which never reaches the identity authority at all, and on an everywhere scope
 * it is `true` only once that authority confirmed ending its side.
 */
export interface SignOutOutcome {
    /** Whether the provider confirmed revoking this browser's refresh lineage. */
    readonly remoteRevocationObserved: boolean
    /** Whether the identity authority confirmed an everywhere scope's own ending; null when none was asked. */
    readonly authorityEndingConfirmed: boolean | null
}

/**
 * Ending sessions under a workspace: the workspace's owner confirms the requester, and the target
 * is the member the requester selected from that workspace's authorized Office roster.
 *
 * THE ROSTER MEMBER, NEVER A PRINCIPAL. This browser neither learns nor sends the member's Login
 * principal or email - it holds a display name and a memberId, which is also why a stale or
 * reassigned memberId can only ever come back as the generic refusal or as undecided.
 */
export interface EndPrincipalSessionsWorkspaceInput {
    /** This one logical ending request's stable identity; resend it unchanged on retry. */
    readonly requestId: string
    /** The workspace the requester administers, whose owner confirms the requester's authority. */
    readonly workspaceId: string
    /** The roster member whose sessions would end; the authority owner resolves its principal. */
    readonly memberId: string
}

/**
 * Ending sessions as a Nivo operation: Login itself checks the requester's platform-operator
 * assignment, so this form names the target principal directly.
 *
 * SERVER-ONLY DESIGN. No accepted record establishes an operator control or an operator signal in
 * this app, so the workspace surface never offers this form; it stays typed because the operation
 * publishes it.
 */
export interface EndPrincipalSessionsOperationInput {
    /** This one logical ending request's stable identity; resend it unchanged on retry. */
    readonly requestId: string
    /** The Login principal whose sessions would end. */
    readonly targetPrincipal: string
}

/**
 * What ending another principal's sessions asks for: one request identity and exactly ONE authority
 * context - a workspace with the roster member selected in it, or the server-only Nivo operation
 * with the target principal. Never both, and never a principal on the workspace form.
 */
export type EndPrincipalSessionsInput = EndPrincipalSessionsWorkspaceInput | EndPrincipalSessionsOperationInput

/** Which of the three decided answers an ending request produced. */
export type EndPrincipalSessionsKind =
    /** The asked scope was applied. */
    | "scopeApplied"
    /** An authority did not answer; the same request identity continues it. Never a refusal. */
    | "undecided"
    /** The generic refusal, in the same terms every refusal uses. */
    | "refused"

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
    readonly kind: EndPrincipalSessionsKind
    /** For the applied scope, whether the identity authority confirmed its own side; else null. */
    readonly authorityEndingConfirmed: boolean | null
}

/** What finishing a two-factor sign-in asks for. */
export interface VerifyTwoFactorInput {
    /** The challenge handed back by the first step. */
    readonly twoFactorToken: string
    /** The code the reader read off their authenticator. */
    readonly code: string
}

/**
 * Which identity provider a shortcut hands off to.
 *
 * The value travels exactly as spelled here: it is the Keycloak identity-provider alias, and the
 * backend puts it straight on the authorization URL as `kc_idp_hint`.
 */
export type OauthProvider = "google" | "github"

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
    readonly code: string
    /** Which door the hand-off went through; the backend refuses a bundle cached for another one. */
    readonly provider: OauthProvider
    /** The opaque handle the redirect endpoint issued, and the only state this browser carries. */
    readonly state: string
}

/** What asking for a reset link needs. */
export interface RequestPasswordResetInput {
    /** Where to send it. */
    readonly email: string
}

/** What spending a reset link needs. */
export interface ResetPasswordInput {
    /** The token out of the link. */
    readonly token: string
    /** The password to set. */
    readonly newPassword: string
}
