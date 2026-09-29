/** The fields every payload-returning operation selects. */
export const AUTH_PAYLOAD = "{ accessToken requiresTwoFactor twoFactorToken }"

/**
 * A sign-in's session, plus the one place it lands and the undecided result.
 *
 * `undecided` is an object rather than a scalar, so it is selected through its one field; GraphQL
 * answers null for the whole object when there is nothing to say, which is exactly the shape
 * {@link SignInPayload} types.
 */
export const SIGN_IN_PAYLOAD =
    "{ accessToken requiresTwoFactor twoFactorToken destination undecided { retryWithSameRequest } }"

/** A brokered completion or continuation: a session, its undecided result and the email refusal. */
export const BROKERED_PAYLOAD =
    "{ accessToken requiresTwoFactor twoFactorToken providerEmailRefused undecided { continuationReference } }"

/** A registration completion: a session, its deliberate conclusion and the undecided result. */
export const SIGN_UP_VERIFY_PAYLOAD =
    "{ accessToken requiresTwoFactor twoFactorToken conclusion { reason } undecided { retryWithSameRequest } }"

/** The fields every challenge-returning operation selects. */
export const OTP_CHALLENGE = "{ challengeId expiresInSeconds }"

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
