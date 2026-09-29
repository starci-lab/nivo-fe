/**
 * The parsers of every authentication document.
 *
 * One parser per payload the auth operations select, beside the types it names. Each returns the
 * freshly built value or null; the transport turns null into an `unavailable` outcome, so a
 * malformed answer is never a thrown error and never a payload under a borrowed name.
 */

import { isBoolean, isNullableBoolean, isNullableString, isNumber, isOneOf, isRecord, isString } from "../wire"
import type { EnvelopeAnswer, EnvelopeShell } from "../graphql"
import type {
    AuthConclusion,
    AuthConclusionReason,
    AuthPayload,
    ContinueBrokeredSignInPayload,
    EndPrincipalSessionsAnswer,
    EndPrincipalSessionsKind,
    ExchangeOauthCodePayload,
    OtpChallenge,
    SignInPayload,
    SignOutOutcome,
    SignUpVerifyOtpPayload,
} from "./types"

const AUTH_CONCLUSION_REASONS: ReadonlyArray<AuthConclusionReason> = [
    "heldAddress",
    "registeredSignInRequired",
    "passwordResetConfirmed",
]

const isAuthConclusionReason = (value: unknown): value is AuthConclusionReason =>
    isOneOf(value, AUTH_CONCLUSION_REASONS)

const parseAuthConclusion = (value: unknown): AuthConclusion | null =>
    isRecord(value) && isAuthConclusionReason(value.reason) ? { reason: value.reason } : null

/*
 * `AuthUndecided` carries one flag. The plain-sign-in wire states it; the brokered continuation's
 * wire states a `continuationReference` instead (its undecided is the brokered shape), so the flag
 * reads `=== true` rather than `typeof` - an absent flag is no continuation flag, as the unchecked
 * reads already treated it.
 */
const parseAuthUndecided = (value: unknown): { readonly retryWithSameRequest: boolean } | null =>
    isRecord(value) ? { retryWithSameRequest: value.retryWithSameRequest === true } : null

const parseAuthBrokeredUndecided = (value: unknown): { readonly continuationReference: string | null } | null =>
    isRecord(value) && isNullableString(value.continuationReference)
        ? { continuationReference: value.continuationReference }
        : null

const parseNullable = <T>(value: unknown, parse: (input: unknown) => T | null): T | null | undefined =>
    value === null || value === undefined ? value : (parse(value) ?? undefined)

const authBase = (value: Record<string, unknown>): AuthPayload | null =>
    isNullableString(value.accessToken) &&
    isBoolean(value.requiresTwoFactor) &&
    isNullableString(value.twoFactorToken)
        ? {
              accessToken: value.accessToken,
              requiresTwoFactor: value.requiresTwoFactor,
              twoFactorToken: value.twoFactorToken,
          }
        : null

/** Parse the session payload every session-issuing operation answers. */
export const parseAuthPayload = (input: unknown): AuthPayload | null =>
    isRecord(input) ? authBase(input) : null

/** Parse a password sign-in's answer: the session fields, its landing and the undecided result. */
export const parseSignInPayload = (input: unknown): SignInPayload | null => {
    if (!isRecord(input) || !isNullableString(input.destination)) return null
    const undecided = parseNullable(input.undecided, parseAuthUndecided)
    if (undecided === undefined) return null
    const base = authBase(input)
    return base === null ? null : { ...base, destination: input.destination, undecided }
}

/** Parse spending a sign-up code: the session fields, the conclusion and the undecided result. */
export const parseSignUpVerifyOtpPayload = (input: unknown): SignUpVerifyOtpPayload | null => {
    if (!isRecord(input)) return null
    const conclusion = parseNullable(input.conclusion, parseAuthConclusion)
    const undecided = parseNullable(input.undecided, parseAuthUndecided)
    if (conclusion === undefined || undecided === undefined) return null
    const base = authBase(input)
    return base === null ? null : { ...base, conclusion, undecided }
}

/** Parse trading a provider callback: the session fields, the brokered undecided, the email refusal. */
export const parseExchangeOauthCodePayload = (input: unknown): ExchangeOauthCodePayload | null => {
    if (!isRecord(input) || !isNullableBoolean(input.providerEmailRefused)) return null
    const undecided = parseNullable(input.undecided, parseAuthBrokeredUndecided)
    if (undecided === undefined) return null
    const base = authBase(input)
    return base === null ? null : { ...base, undecided, providerEmailRefused: input.providerEmailRefused }
}

/** Parse repeating a held brokered proof: the session fields, the plain undecided, the email refusal. */
export const parseContinueBrokeredSignInPayload = (input: unknown): ContinueBrokeredSignInPayload | null => {
    if (!isRecord(input) || !isNullableBoolean(input.providerEmailRefused)) return null
    const undecided = parseNullable(input.undecided, parseAuthUndecided)
    if (undecided === undefined) return null
    const base = authBase(input)
    return base === null ? null : { ...base, undecided, providerEmailRefused: input.providerEmailRefused }
}

/** Parse a mailed-code challenge. */
export const parseOtpChallenge = (input: unknown): OtpChallenge | null =>
    isRecord(input) && isString(input.challengeId) && isNumber(input.expiresInSeconds)
        ? { challengeId: input.challengeId, expiresInSeconds: input.expiresInSeconds }
        : null

const END_PRINCIPAL_SESSIONS_KINDS: ReadonlyArray<EndPrincipalSessionsKind> = ["scopeApplied", "undecided", "refused"]

/** Parse the one-shape answer an administrator session-ending returns. */
export const parseEndPrincipalSessionsAnswer = (input: unknown): EndPrincipalSessionsAnswer | null =>
    isRecord(input) && isOneOf(input.kind, END_PRINCIPAL_SESSIONS_KINDS) && isNullableBoolean(input.authorityEndingConfirmed)
        ? { kind: input.kind, authorityEndingConfirmed: input.authorityEndingConfirmed }
        : null

/**
 * Parse the sign-out envelope: the completion flag as `data` and the two answers the envelope states
 * beside it.
 */
export const parseSignOutEnvelope = (shell: EnvelopeShell): EnvelopeAnswer<boolean, SignOutOutcome> | null => {
    const revocation: unknown = shell.siblings.remoteRevocationObserved
    const authority: unknown = shell.siblings.authorityEndingConfirmed
    if (!isBoolean(shell.data) || !isBoolean(revocation)) return null
    if (authority !== null && !isBoolean(authority)) return null
    return {
        data: shell.data,
        error: shell.error,
        message: shell.message,
        success: shell.success,
        remoteRevocationObserved: revocation,
        authorityEndingConfirmed: authority,
    }
}
