import { describe, expect, it } from "vitest"

import {
    parseAuthPayload,
    parseContinueBrokeredSignInPayload,
    parseEndPrincipalSessionsAnswer,
    parseExchangeOauthCodePayload,
    parseOtpChallenge,
    parseSignInPayload,
    parseSignOutEnvelope,
    parseSignUpVerifyOtpPayload,
} from "./guards"

const session = {
    accessToken: "tok",
    requiresTwoFactor: false,
    twoFactorToken: null,
}

describe("parseAuthPayload", () => {
    it("refuses a malformed payload: a wrong primitive or a missing session flag", () => {
        expect(parseAuthPayload(session)).toEqual(session)
        expect(parseAuthPayload(null)).toBeNull()
        expect(parseAuthPayload({ accessToken: "tok", requiresTwoFactor: "yes", twoFactorToken: null })).toBeNull()
    })
})

describe("parseSignInPayload", () => {
    it("refuses a malformed payload: a non-nullable undecided result that does not parse", () => {
        expect(parseSignInPayload({ ...session, destination: null, undecided: null })).not.toBeNull()
        expect(parseSignInPayload("x")).toBeNull()
        expect(parseSignInPayload({ ...session, destination: "/app", undecided: "pending" })).toBeNull()
    })
})

describe("parseSignUpVerifyOtpPayload", () => {
    it("refuses a conclusion the wire grammar does not name", () => {
        expect(
            parseSignUpVerifyOtpPayload({ ...session, conclusion: { reason: "registeredSignInRequired" }, undecided: null }),
        ).not.toBeNull()
        expect(
            parseSignUpVerifyOtpPayload({ ...session, conclusion: { reason: "half-registered" }, undecided: null }),
        ).toBeNull()
    })
})

describe("parseExchangeOauthCodePayload", () => {
    it("refuses a malformed brokered undecided or a missing refusal flag", () => {
        expect(
            parseExchangeOauthCodePayload({
                ...session,
                undecided: { continuationReference: "ref-1" },
                providerEmailRefused: null,
            }),
        ).not.toBeNull()
        expect(parseExchangeOauthCodePayload({ ...session, undecided: 7, providerEmailRefused: null })).toBeNull()
        expect(parseExchangeOauthCodePayload({ ...session, undecided: null })).toBeNull()
    })
})

describe("parseContinueBrokeredSignInPayload", () => {
    it("refuses a malformed payload while reading an absent retry flag as false", () => {
        const parsed = parseContinueBrokeredSignInPayload({
            ...session,
            undecided: {},
            providerEmailRefused: false,
        })
        expect(parsed?.undecided?.retryWithSameRequest).toBe(false)
        expect(parseContinueBrokeredSignInPayload([])).toBeNull()
        expect(
            parseContinueBrokeredSignInPayload({ ...session, undecided: null, providerEmailRefused: "no" }),
        ).toBeNull()
    })
})

describe("parseOtpChallenge", () => {
    it("refuses a challenge without its identity or its expiry", () => {
        expect(parseOtpChallenge({ challengeId: "c-1", expiresInSeconds: 300 })).toEqual({
            challengeId: "c-1",
            expiresInSeconds: 300,
        })
        expect(parseOtpChallenge({ challengeId: "c-1" })).toBeNull()
        expect(parseOtpChallenge({ challengeId: "c-1", expiresInSeconds: "300" })).toBeNull()
    })
})

describe("parseEndPrincipalSessionsAnswer", () => {
    it("refuses a kind outside the closed set", () => {
        expect(
            parseEndPrincipalSessionsAnswer({ kind: "refused", authorityEndingConfirmed: null }),
        ).toEqual({ kind: "refused", authorityEndingConfirmed: null })
        expect(parseEndPrincipalSessionsAnswer({ kind: "ended", authorityEndingConfirmed: null })).toBeNull()
        expect(parseEndPrincipalSessionsAnswer({ authorityEndingConfirmed: true })).toBeNull()
    })
})

describe("parseSignOutEnvelope", () => {
    const shell = {
        data: true,
        error: null,
        message: "signed out",
        success: true,
        siblings: { remoteRevocationObserved: true, authorityEndingConfirmed: false },
    }

    it("refuses a shell whose completion flag or revocation mark is not boolean", () => {
        expect(parseSignOutEnvelope(shell)?.remoteRevocationObserved).toBe(true)
        expect(parseSignOutEnvelope({ ...shell, data: "yes" })).toBeNull()
        expect(
            parseSignOutEnvelope({
                ...shell,
                siblings: { remoteRevocationObserved: "yes", authorityEndingConfirmed: false },
            }),
        ).toBeNull()
    })
})
