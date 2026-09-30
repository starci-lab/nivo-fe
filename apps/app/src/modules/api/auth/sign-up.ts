import { type Outcome } from "@nivo/api"
import {
    SignUpInitDocument,
    SignUpResendDocument,
    SignUpVerifyOtpDocument,
} from "../__generated__/core"
import { graphql } from "../graphql"
import { parseOtpChallenge, parseSignUpVerifyOtpPayload } from "./guards"
import type {
    OtpChallenge,
    SignUpInitInput,
    SignUpResendInput,
    SignUpVerifyOtpInput,
    SignUpVerifyOtpPayload,
} from "../__generated__/core"

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
export const signUpInit = (input: SignUpInitInput): Promise<Outcome<OtpChallenge>> =>
    graphql(
        SignUpInitDocument,
        parseOtpChallenge,
        {
            input,
        },
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
export const signUpResend = (input: SignUpResendInput): Promise<Outcome<OtpChallenge>> =>
    graphql(
        SignUpResendDocument,
        parseOtpChallenge,
        {
            input,
        },
    )

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
export const signUpVerifyOtp = (input: SignUpVerifyOtpInput): Promise<Outcome<SignUpVerifyOtpPayload>> =>
    graphql(
        SignUpVerifyOtpDocument,
        parseSignUpVerifyOtpPayload,
        {
            input,
        },
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
