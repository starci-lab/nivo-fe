import { graphql, type Result } from "./graphql"

/**
 * Every authentication operation nivo-core publishes, typed once.
 *
 * THE DOCUMENTS ARE WRITTEN OUT rather than generated. There are nine of them, they change when the
 * backend changes, and a codegen step would put a build tool between a reader and the exact fields
 * this app asks for. When the console's read queries land and the count passes a few dozen, that
 * trade flips.
 *
 * WHAT `AuthPayload` MEANS, because it is the shape everything here returns. A successful password
 * sign-in answers `{ accessToken, requiresTwoFactor: false, twoFactorToken: null }`. An account with
 * a second factor answers `{ accessToken: null, requiresTwoFactor: true, twoFactorToken: "..." }` -
 * NOT an error. The caller must read `requiresTwoFactor` before it reads `accessToken`, because a
 * null token there is a challenge rather than a refusal.
 *
 * THE REFRESH TOKEN IS ABSENT FROM EVERY TYPE HERE, deliberately. It never crosses into JavaScript:
 * the backend writes it as an HttpOnly cookie and the browser carries it. A field for it would be a
 * field that is always undefined, and the first person to try filling it would move the token into
 * script-readable storage.
 */

/** What the backend answers to every credential exchange. */
export interface AuthPayload {
    /** The Bearer credential, or null while a second factor is still owed. */
    readonly accessToken: string | null
    /** Whether a TOTP code is required to finish this sign-in. */
    readonly requiresTwoFactor: boolean
    /** The opaque challenge to hand back to `verifyTwoFactor`; present only with the flag above. */
    readonly twoFactorToken: string | null
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

/** What creating an account asks for. */
export interface SignUpInput {
    /** The address the account is keyed on. */
    readonly email: string
    /** The password as typed. */
    readonly password: string
    /** A display name, when the reader gave one. */
    readonly name?: string
}

/** What exchanging credentials asks for. */
export interface SignInInput {
    /** The address. */
    readonly email: string
    /** The password as typed. */
    readonly password: string
}

/** What finishing a two-factor sign-in asks for. */
export interface VerifyTwoFactorInput {
    /** The challenge handed back by the first step. */
    readonly twoFactorToken: string
    /** The code the reader read off their authenticator. */
    readonly code: string
}

/** What trading an OAuth authorization code asks for. */
export interface ExchangeOauthCodeInput {
    /** The code the provider put on the callback URL. */
    readonly code: string
    /** The PKCE verifier this browser generated before leaving. */
    readonly codeVerifier: string
    /** The redirect the provider was given, which it will check against. */
    readonly redirectUri: string
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

/** The fields every payload-returning operation selects. */
const AUTH_PAYLOAD = "{ accessToken requiresTwoFactor twoFactorToken }"

/** The fields every challenge-returning operation selects. */
const OTP_CHALLENGE = "{ challengeId expiresInSeconds }"

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
export const signUpInit = (input: SignUpInitInput): Promise<Result<OtpChallenge>> =>
    graphql(
        `mutation SignUpInit($input: SignUpInitInput!) { signUpInit(input: $input) { data ${OTP_CHALLENGE} message success error } }`,
        { input },
    )

/**
 * Send another sign-up code.
 *
 * REFUSED INSIDE SIXTY SECONDS with `OTP_RESEND_TOO_SOON_EXCEPTION`, which is a real rate limit
 * rather than a courtesy - the caller must not press this on a timer.
 *
 * @param input - The challenge to renew.
 * @returns The renewed challenge, or why it was refused.
 */
export const signUpResend = (input: OtpResendInput): Promise<Result<OtpChallenge>> =>
    graphql(
        `mutation SignUpResend($input: SignUpResendInput!) { signUpResend(input: $input) { data ${OTP_CHALLENGE} message success error } }`,
        { input },
    )

/**
 * Spend a sign-up code, which is what actually creates the account.
 *
 * @param input - The challenge and the code.
 * @returns The session, or why there is none.
 */
export const signUpVerifyOtp = (input: SignUpVerifyOtpInput): Promise<Result<AuthPayload>> =>
    graphql(
        `mutation SignUpVerifyOtp($input: SignUpVerifyOtpInput!) { signUpVerifyOtp(input: $input) { data ${AUTH_PAYLOAD} message success error } }`,
        { input },
    )

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
export const forgotPasswordInit = (input: ForgotPasswordInitInput): Promise<Result<OtpChallenge>> =>
    graphql(
        `mutation ForgotPasswordInit($input: ForgotPasswordInitInput!) { forgotPasswordInit(input: $input) { data ${OTP_CHALLENGE} message success error } }`,
        { input },
    )

/**
 * Send another reset code.
 *
 * @param input - The challenge to renew.
 * @returns The renewed challenge, or why it was refused.
 */
export const forgotPasswordResend = (input: OtpResendInput): Promise<Result<OtpChallenge>> =>
    graphql(
        `mutation ForgotPasswordResend($input: ForgotPasswordResendInput!) { forgotPasswordResend(input: $input) { data ${OTP_CHALLENGE} message success error } }`,
        { input },
    )

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
export const forgotPasswordVerifyOtp = (input: ForgotPasswordVerifyOtpInput): Promise<Result<boolean>> =>
    graphql(
        `mutation ForgotPasswordVerifyOtp($input: ForgotPasswordVerifyOtpInput!) { forgotPasswordVerifyOtp(input: $input) { data message success error } }`,
        { input },
    )

/**
 * Create an account.
 *
 * @param input - The email, the password and an optional display name.
 * @returns The session, or a two-factor challenge, or why there is neither.
 */
export const signUp = (input: SignUpInput): Promise<Result<AuthPayload>> =>
    graphql(
        `mutation SignUp($input: SignUpInput!) { signUp(input: $input) { data ${AUTH_PAYLOAD} message success error } }`,
        { input },
    )

/**
 * Exchange an email and password for a session.
 *
 * @param input - The credentials as typed.
 * @returns The session, or a two-factor challenge, or why there is neither.
 */
export const signIn = (input: SignInInput): Promise<Result<AuthPayload>> =>
    graphql(
        `mutation SignIn($input: SignInInput!) { signIn(input: $input) { data ${AUTH_PAYLOAD} message success error } }`,
        { input },
    )

/**
 * Finish a sign-in that owed a second factor.
 *
 * @param input - The challenge token from the first step, and the code the reader typed.
 * @returns The session, or why the code was refused.
 */
export const verifyTwoFactor = (input: VerifyTwoFactorInput): Promise<Result<AuthPayload>> =>
    graphql(
        `mutation VerifyTwoFactor($input: VerifyTwoFactorInput!) { verifyTwoFactor(input: $input) { data ${AUTH_PAYLOAD} message success error } }`,
        { input },
    )

/**
 * Trade an OAuth authorization code for a session.
 *
 * @param input - The code, the PKCE verifier and the redirect the provider was given.
 * @returns The session, or a two-factor challenge, or why there is neither.
 */
export const exchangeOauthCode = (input: ExchangeOauthCodeInput): Promise<Result<AuthPayload>> =>
    graphql(
        `mutation ExchangeOauthCode($input: ExchangeOauthCodeInput!) { exchangeOauthCode(input: $input) { data ${AUTH_PAYLOAD} message success error } }`,
        { input },
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
export const requestPasswordReset = (input: RequestPasswordResetInput): Promise<Result<boolean>> =>
    graphql(
        `mutation RequestPasswordReset($input: RequestPasswordResetInput!) { requestPasswordReset(input: $input) { data message success error } }`,
        { input },
    )

/**
 * Set a new password from a reset link.
 *
 * @param input - The token out of the link, and the new password.
 * @returns Whether it was accepted.
 */
export const resetPassword = (input: ResetPasswordInput): Promise<Result<boolean>> =>
    graphql(
        `mutation ResetPassword($input: ResetPasswordInput!) { resetPassword(input: $input) { data message success error } }`,
        { input },
    )

/**
 * Trade the HttpOnly refresh cookie for a fresh access token.
 *
 * TAKES NO ARGUMENT ON PURPOSE. The credential is the cookie, which the browser attaches; an argument
 * here would imply the refresh token is something this code holds, and the whole design is that it is
 * not.
 *
 * @returns A fresh session, or why there is none.
 */
export const refreshSession = (): Promise<Result<AuthPayload>> =>
    graphql(`mutation RefreshSession { refreshSession { data ${AUTH_PAYLOAD} message success error } }`)

/**
 * End the session and clear the refresh cookie.
 *
 * @returns Whether the server acknowledged.
 */
export const signOut = (): Promise<Result<boolean>> =>
    graphql("mutation SignOut { signOut { data message success error } }")
