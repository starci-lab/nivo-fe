import { mutate } from "../graphql"
import type { AuthEntry, AuthPayload, GraphQLResult, OtpChallenge, PasswordReset } from "../graphql"

/*
 * The nine OTP operations of the academy API, one function each.
 *
 * PORTED IN SHAPE, NOT IN TEXT. starci-academy-fe has the same nine, and its
 * hook is what this repository's `useAuthPanel` is ported from -- but its
 * documents cannot be copied, because the API underneath differs in three ways
 * that a copy would get silently wrong:
 *
 *   1. the argument is `input`, not `request`;
 *   2. the resend operations are `signUpResend` / `signInResend` /
 *      `forgotPasswordResend`, not `...ResendOtp`;
 *   3. the new password is supplied at forgot-password VERIFY, not at init --
 *      nivo's backend deliberately does not hold a password for the ten minutes
 *      a challenge is open unless it has to.
 *
 * Each was checked against the live schema rather than against the sibling
 * repository, because a document that names a field the server does not have
 * fails as "Cannot query field", which reads like an outage and is not one.
 *
 * The whole envelope is selected everywhere: a refusal arrives as a 200 with
 * `success: false` and a sentence for the reader.
 */

/** What opening a sign-up challenge needs. */
export interface SignUpInitInput {
    /** The address being registered; the code is sent here. */
    readonly email: string
    /** The password to set once the address is proven. */
    readonly password: string
    /** Optional display name; the API derives the profile fields from it. */
    readonly name?: string
}

/** What opening a code-verified sign-in needs. */
export interface SignInInitInput {
    /** The account's address. */
    readonly email: string
    /** The account's password, checked before any code is sent. */
    readonly password: string
}

/** What redeeming a sign-up or sign-in challenge needs. */
export interface VerifyOtpInput {
    /** Handle from the matching init or resend. */
    readonly challengeId: string
    /** The code from the email. */
    readonly otp: string
}

/** What completing a password reset needs. */
export interface ForgotPasswordVerifyOtpInput extends VerifyOtpInput {
    /** The replacement password, supplied at verify rather than at init. */
    readonly newPassword: string
}

/**
 * What an entry step returns: a challenge to verify, or a session because this
 * academy does not require verification. Exactly one is present.
 */
const ENTRY_SELECTION = `success message error data { challenge { challengeId expiresInSeconds } session { accessToken } }`

/** The fields a resend selects -- it never produces a session. */
const CHALLENGE_SELECTION = `success message error data { challengeId expiresInSeconds }`

/** The fields every session-returning operation selects. */
const SESSION_SELECTION = `success message error data { accessToken }`

/**
 * Opens a sign-up challenge. Creates no account -- that happens at verify.
 *
 * @param input - The address, the chosen password, and an optional display name.
 * @param signal - Optional abort signal.
 * @returns The challenge or the session, or the refusal.
 */
export const signUpInit = async (
    input: SignUpInitInput,
    signal?: AbortSignal,
): Promise<GraphQLResult<AuthEntry>> =>
    mutate(
        `mutation SignUpInit($input: SignUpInitInput!) { signUpInit(input: $input) { ${ENTRY_SELECTION} } }`,
        { input },
        "signUpInit",
        signal,
    )

/**
 * Re-sends the sign-up code. The previous one stops working.
 *
 * @param challengeId - Handle from {@link signUpInit}.
 * @param signal - Optional abort signal.
 * @returns The refreshed challenge, or the refusal.
 */
export const signUpResend = async (
    challengeId: string,
    signal?: AbortSignal,
): Promise<GraphQLResult<OtpChallenge>> =>
    mutate(
        `mutation SignUpResend($input: SignUpResendInput!) { signUpResend(input: $input) { ${CHALLENGE_SELECTION} } }`,
        { input: { challengeId } },
        "signUpResend",
        signal,
    )

/**
 * Redeems the sign-up code: creates the account and starts the session.
 *
 * @param input - The challenge handle and the code.
 * @param signal - Optional abort signal.
 * @returns The session, or the refusal.
 */
export const signUpVerifyOtp = async (
    input: VerifyOtpInput,
    signal?: AbortSignal,
): Promise<GraphQLResult<AuthPayload>> =>
    mutate(
        `mutation SignUpVerifyOtp($input: SignUpVerifyOtpInput!) { signUpVerifyOtp(input: $input) { ${SESSION_SELECTION} } }`,
        { input },
        "signUpVerifyOtp",
        signal,
    )

/**
 * Opens a code-verified sign-in. The password is checked here.
 *
 * @param input - The address and password.
 * @param signal - Optional abort signal.
 * @returns The challenge or the session, or the refusal.
 */
export const signInInit = async (
    input: SignInInitInput,
    signal?: AbortSignal,
): Promise<GraphQLResult<AuthEntry>> =>
    mutate(
        `mutation SignInInit($input: SignInInitInput!) { signInInit(input: $input) { ${ENTRY_SELECTION} } }`,
        { input },
        "signInInit",
        signal,
    )

/**
 * Re-sends the sign-in code. The previous one stops working.
 *
 * @param challengeId - Handle from {@link signInInit}.
 * @param signal - Optional abort signal.
 * @returns The refreshed challenge, or the refusal.
 */
export const signInResend = async (
    challengeId: string,
    signal?: AbortSignal,
): Promise<GraphQLResult<OtpChallenge>> =>
    mutate(
        `mutation SignInResend($input: SignInResendInput!) { signInResend(input: $input) { ${CHALLENGE_SELECTION} } }`,
        { input: { challengeId } },
        "signInResend",
        signal,
    )

/**
 * Redeems the sign-in code and starts the session.
 *
 * @param input - The challenge handle and the code.
 * @param signal - Optional abort signal.
 * @returns The session, or the refusal.
 */
export const signInVerifyOtp = async (
    input: VerifyOtpInput,
    signal?: AbortSignal,
): Promise<GraphQLResult<AuthPayload>> =>
    mutate(
        `mutation SignInVerifyOtp($input: SignInVerifyOtpInput!) { signInVerifyOtp(input: $input) { ${SESSION_SELECTION} } }`,
        { input },
        "signInVerifyOtp",
        signal,
    )

/**
 * Opens a password-reset challenge.
 *
 * It answers the same whether or not the address has an account, so the caller
 * must not treat success as proof that one exists -- and the panel's copy at
 * this step is written accordingly.
 *
 * @param email - The address to reset.
 * @param signal - Optional abort signal.
 * @returns The challenge.
 */
export const forgotPasswordInit = async (
    email: string,
    signal?: AbortSignal,
): Promise<GraphQLResult<OtpChallenge>> =>
    mutate(
        `mutation ForgotPasswordInit($input: ForgotPasswordInitInput!) { forgotPasswordInit(input: $input) { ${CHALLENGE_SELECTION} } }`,
        { input: { email } },
        "forgotPasswordInit",
        signal,
    )

/**
 * Re-sends the reset code, if there was ever anybody to send it to.
 *
 * @param challengeId - Handle from {@link forgotPasswordInit}.
 * @param signal - Optional abort signal.
 * @returns The refreshed challenge.
 */
export const forgotPasswordResend = async (
    challengeId: string,
    signal?: AbortSignal,
): Promise<GraphQLResult<OtpChallenge>> =>
    mutate(
        `mutation ForgotPasswordResend($input: ForgotPasswordResendInput!) { forgotPasswordResend(input: $input) { ${CHALLENGE_SELECTION} } }`,
        { input: { challengeId } },
        "forgotPasswordResend",
        signal,
    )

/**
 * Redeems the reset code and sets the new password.
 *
 * The new password travels HERE rather than at init, which is where this
 * differs from starci's flow: the panel therefore has to keep it until the
 * reader has been to their inbox.
 *
 * @param input - The challenge handle, the code, and the new password.
 * @param signal - Optional abort signal.
 * @returns The completed reset, or the refusal.
 */
export const forgotPasswordVerifyOtp = async (
    input: ForgotPasswordVerifyOtpInput,
    signal?: AbortSignal,
): Promise<GraphQLResult<PasswordReset>> =>
    mutate(
        `mutation ForgotPasswordVerifyOtp($input: ForgotPasswordVerifyOtpInput!) { forgotPasswordVerifyOtp(input: $input) { success message error data { email } } }`,
        { input },
        "forgotPasswordVerifyOtp",
        signal,
    )
