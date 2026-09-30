import { parseBooleanAnswer, type Outcome } from "@nivo/api"
import { graphql } from "../graphql"
import { OTP_CHALLENGE } from "./documents"
import { parseOtpChallenge } from "./guards"
import type { ForgotPasswordInitInput, ForgotPasswordVerifyOtpInput, OtpChallenge, OtpResendInput, RequestPasswordResetInput, ResetPasswordInput } from "./types"

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
export const forgotPasswordInit = (input: ForgotPasswordInitInput): Promise<Outcome<OtpChallenge>> =>
    graphql(
        `mutation ForgotPasswordInit($input: ForgotPasswordInitInput!) { forgotPasswordInit(request: $input) { data ${OTP_CHALLENGE} message success error } }`,
        parseOtpChallenge,
        {
            input,
        },
    )

/**
 * Send another reset code.
 *
 * @param input - The challenge to renew.
 * @returns The renewed challenge, or why it was refused.
 */
export const forgotPasswordResend = (input: OtpResendInput): Promise<Outcome<OtpChallenge>> =>
    graphql(
        `mutation ForgotPasswordResend($input: ForgotPasswordResendInput!) { forgotPasswordResend(request: $input) { data ${OTP_CHALLENGE} message success error } }`,
        parseOtpChallenge,
        {
            input,
        },
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
export const forgotPasswordVerifyOtp = (input: ForgotPasswordVerifyOtpInput): Promise<Outcome<boolean>> =>
    graphql(
        `
            mutation ForgotPasswordVerifyOtp($input: ForgotPasswordVerifyOtpInput!) {
                forgotPasswordVerifyOtp(request: $input) {
                    data
                    message
                    success
                    error
                }
            }
        `,
        parseBooleanAnswer,
        {
            input,
        },
    )

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
export const requestPasswordReset = (input: RequestPasswordResetInput): Promise<Outcome<boolean>> =>
    graphql(
        `
            mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
                requestPasswordReset(request: $input) {
                    data
                    message
                    success
                    error
                }
            }
        `,
        parseBooleanAnswer,
        {
            input,
        },
    )

/**
 * Set a new password from a reset link.
 *
 * @param input - The token out of the link, and the new password.
 * @returns Whether it was accepted.
 */
export const resetPassword = (input: ResetPasswordInput): Promise<Outcome<boolean>> =>
    graphql(
        `
            mutation ResetPassword($input: ResetPasswordInput!) {
                resetPassword(request: $input) {
                    data
                    message
                    success
                    error
                }
            }
        `,
        parseBooleanAnswer,
        {
            input,
        },
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
