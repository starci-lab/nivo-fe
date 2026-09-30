import { parseBooleanAnswer, type Outcome } from "@nivo/api"
import {
    ForgotPasswordInitDocument,
    ForgotPasswordResendDocument,
    ForgotPasswordVerifyOtpDocument,
    RequestPasswordResetDocument,
    ResetPasswordDocument,
} from "../__generated__/core"
import type {
    ForgotPasswordInitInput,
    ForgotPasswordResendInput,
    ForgotPasswordVerifyOtpInput,
    OtpChallenge,
    RequestPasswordResetInput,
    ResetPasswordInput,
} from "../__generated__/core"
import { graphql } from "../graphql"
import { parseOtpChallenge } from "./guards"

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
    graphql(ForgotPasswordInitDocument, parseOtpChallenge, { input })

/**
 * Send another reset code.
 *
 * @param input - The challenge to renew.
 * @returns The renewed challenge, or why it was refused.
 */
export const forgotPasswordResend = (input: ForgotPasswordResendInput): Promise<Outcome<OtpChallenge>> =>
    graphql(ForgotPasswordResendDocument, parseOtpChallenge, { input })

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
    graphql(ForgotPasswordVerifyOtpDocument, parseBooleanAnswer, { input })

/**
 * Ask for a password reset link.
 *
 * ALWAYS ANSWERS THE SAME WAY on the backend whether or not the email is known, so callers must not
 * turn a false answer into an account-existence signal.
 *
 * @param input - The email to send to.
 * @returns Whether the request was accepted.
 */
export const requestPasswordReset = (input: RequestPasswordResetInput): Promise<Outcome<boolean>> =>
    graphql(RequestPasswordResetDocument, parseBooleanAnswer, { input })

/**
 * Set a new password from a reset link.
 *
 * @param input - The token from the link and the new password.
 * @returns Whether the password was reset.
 */
export const resetPassword = (input: ResetPasswordInput): Promise<Outcome<boolean>> =>
    graphql(ResetPasswordDocument, parseBooleanAnswer, { input })
