import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../graphql", () => ({ graphql: vi.fn(), graphqlEnvelope: vi.fn() }))

import { graphql, graphqlEnvelope } from "../graphql"
import {
    continueBrokeredSignIn,
    endPrincipalSessions,
    exchangeOauthCode,
    forgotPasswordInit,
    forgotPasswordResend,
    forgotPasswordVerifyOtp,
    oauthRedirectUrl,
    refreshSession,
    requestPasswordReset,
    resetPassword,
    signIn,
    signOut,
    signUpInit,
    signUpResend,
    signUpVerifyOtp,
    verifyTwoFactor,
} from "./index"

/** The document of the one call the operation under test just made. */
const lastDocument = () => vi.mocked(graphql).mock.calls.at(-1)?.[0] ?? ""
/** The variables of the one call the operation under test just made. */
const lastVariables = () => vi.mocked(graphql).mock.calls.at(-1)?.[2]
/** The document of the one envelope-stating call the operation under test just made. */
const lastEnvelopeDocument = () => vi.mocked(graphqlEnvelope).mock.calls.at(-1)?.[0] ?? ""
/** The variables of the one envelope-stating call the operation under test just made. */
const lastEnvelopeVariables = () => vi.mocked(graphqlEnvelope).mock.calls.at(-1)?.[2]

beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(graphql).mockResolvedValue({ ok: true, data: {} })
    vi.mocked(graphqlEnvelope).mockResolvedValue({
        ok: true,
        data: { data: {}, message: "", success: true },
    })
})

describe("oauthRedirectUrl", () => {
    it("builds the provider redirect URL without nesting under graphql", () => {
        expect(oauthRedirectUrl("google", "http://localhost:3067/auth/callback?next=/app")).toBe(
            "http://localhost:3068/api/v1/keycloak/google/redirect?redirect_uri=http%3A%2F%2Flocalhost%3A3067%2Fauth%2Fcallback%3Fnext%3D%2Fapp",
        )
    })
})

describe("signUpInit", () => {
    it("does not publish the withdrawn public signUp mutation", async () => {
        /*
         * NO DOOR CREATES AN IDENTITY BEFORE A CONSUMED PROOF. The bypass was removed from the
         * backend schema, so an adapter document for it could only ever answer a GraphQL error.
         */
        const published = await import("./index")
        expect("signUp" in published).toBe(false)
    })

    it("forwards the registration start to its matching operation and variables", async () => {
        const input = { email: "reader@example.test", password: "correct-horse" }

        await signUpInit(input)
        expect(lastDocument()).toContain("mutation SignUpInit")
        expect(lastVariables()).toEqual({ input })
        // one call per operation: the adapter never issues a second document for one submit
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})

describe("signIn", () => {
    it("asks the sign-in for its destination and undecided result, and forwards the attempt identity", async () => {
        await signIn({
            email: "reader@example.test",
            password: "correct-horse",
            requestIdentity: "attempt-1",
            requestedDestination: "/overview",
        })

        expect(lastDocument()).toContain("mutation SignIn")
        // the landing place is resolved server-side and only after a session is current
        expect(lastDocument()).toContain("destination")
        // an undecided answer is an object, so its one field is selected through it
        expect(lastDocument()).toContain("undecided { retryWithSameRequest }")
        expect(lastVariables()).toEqual({
            input: {
                email: "reader@example.test",
                password: "correct-horse",
                requestIdentity: "attempt-1",
                requestedDestination: "/overview",
            },
        })
    })
})

describe("signUpVerifyOtp", () => {
    it("asks a registration completion for its conclusion and undecided result", async () => {
        await signUpVerifyOtp({ challengeId: "challenge-1", otp: "123456" })

        expect(lastDocument()).toContain("mutation SignUpVerifyOtp")
        // the reason is the whole instruction for what the screen offers next
        expect(lastDocument()).toContain("conclusion { reason }")
        expect(lastDocument()).toContain("undecided { retryWithSameRequest }")
        expect(lastVariables()).toEqual({ input: { challengeId: "challenge-1", otp: "123456" } })
    })
})

describe("signUpResend", () => {
    it("forwards the registration resend to its matching operation", async () => {
        await signUpResend({ challengeId: "challenge-1" })

        expect(lastDocument()).toContain("mutation SignUpResend")
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})

describe("exchangeOauthCode", () => {
    it("asks a brokered completion for its continuation reference and the provider-email refusal", async () => {
        await exchangeOauthCode({ code: "code-1", provider: "google", state: "state-1" })

        expect(lastDocument()).toContain("mutation ExchangeOauthCode")
        expect(lastDocument()).toContain("undecided { continuationReference }")
        expect(lastDocument()).toContain("providerEmailRefused")
        expect(lastVariables()).toEqual({
            input: { code: "code-1", provider: "google", state: "state-1" },
        })
    })
})

describe("continueBrokeredSignIn", () => {
    it("continues a held brokered proof under the reference it was given", async () => {
        await continueBrokeredSignIn({ continuationReference: "hold-1" })

        /*
         * The continuation is a one-time hold, not a callback, so repeating it is safe - and its own
         * undecided shape is the plain one, because a lapsed hold hands back no further reference.
         */
        expect(lastDocument()).toContain("mutation ContinueBrokeredSignIn")
        expect(lastDocument()).toContain("undecided { continuationReference }")
        expect(lastDocument()).toContain("providerEmailRefused")
        expect(lastVariables()).toEqual({ input: { continuationReference: "hold-1" } })
    })
})

describe("signOut", () => {
    it("signs out of this browser without sending a scope, through the envelope-stating door", async () => {
        await signOut()

        /*
         * The two answers that tell a completed request apart from an observed revocation ride
         * BESIDE `data`, so the payload-only door would drop them. This one selects them and goes
         * through the transport that carries the whole envelope.
         */
        expect(lastEnvelopeDocument()).toContain("mutation SignOut")
        expect(lastEnvelopeDocument()).toContain("remoteRevocationObserved")
        expect(lastEnvelopeDocument()).toContain("authorityEndingConfirmed")
        // the scope input is nullable, so returning to this browser sends no variable at all
        expect(lastEnvelopeVariables()).toBeUndefined()
        expect(vi.mocked(graphql)).not.toHaveBeenCalled()
    })

    it("signs out everywhere by sending the scope the door reads", async () => {
        await signOut({ scope: "everywhere" })

        expect(lastEnvelopeVariables()).toEqual({ input: { scope: "everywhere" } })
    })
})

describe("endPrincipalSessions", () => {
    it("ends the selected roster member's sessions under the workspace context, and never names a principal", async () => {
        await endPrincipalSessions({
            requestId: "ending-1",
            workspaceId: "workspace-1",
            memberId: "member-1",
        })

        expect(lastDocument()).toContain("mutation EndPrincipalSessions")
        // one shape carries all three answers, told apart by kind alone
        expect(lastDocument()).toContain("data { kind authorityEndingConfirmed }")
        /*
         * The workspace request names the workspace and the roster member the authority owner resolves
         * a principal from; a Login principal or email never crosses this wire.
         */
        expect(lastVariables()).toEqual({
            input: {
                requestId: "ending-1",
                workspaceId: "workspace-1",
                memberId: "member-1",
            },
        })
        expect(lastVariables()?.input).not.toHaveProperty("targetPrincipal")
    })

    it("keeps the server-only Nivo-operation form able to name a principal, with no workspace context", async () => {
        await endPrincipalSessions({ requestId: "ending-2", targetPrincipal: "principal-1" })

        expect(lastVariables()).toEqual({
            input: { requestId: "ending-2", targetPrincipal: "principal-1" },
        })
        expect(lastVariables()?.input).not.toHaveProperty("workspaceId")
        expect(lastVariables()?.input).not.toHaveProperty("memberId")
    })
})

describe("forgotPasswordInit", () => {
    it("forwards the recovery start to its matching operation", async () => {
        await forgotPasswordInit({ email: "reader@example.test" })

        expect(lastDocument()).toContain("mutation ForgotPasswordInit")
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})

describe("forgotPasswordResend", () => {
    it("forwards the recovery resend to its matching operation", async () => {
        await forgotPasswordResend({ challengeId: "reset-1" })

        expect(lastDocument()).toContain("mutation ForgotPasswordResend")
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})

describe("forgotPasswordVerifyOtp", () => {
    it("sets the password through its matching operation and variables", async () => {
        // setting a password is not signing in, so this one answers a boolean and no session is read
        await forgotPasswordVerifyOtp({ challengeId: "challenge-1", otp: "123456", newPassword: "new-correct-horse" })

        expect(lastDocument()).toContain("mutation ForgotPasswordVerifyOtp")
        expect(lastVariables()).toEqual({
            input: { challengeId: "challenge-1", otp: "123456", newPassword: "new-correct-horse" },
        })
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})

describe("verifyTwoFactor", () => {
    it("forwards the second factor to its matching operation and variables", async () => {
        await verifyTwoFactor({ twoFactorToken: "token-1", code: "123456" })

        expect(lastDocument()).toContain("mutation VerifyTwoFactor")
        expect(lastVariables()).toEqual({
            input: { twoFactorToken: "token-1", code: "123456" },
        })
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})

describe("requestPasswordReset", () => {
    it("forwards the recovery request to its matching operation", async () => {
        await requestPasswordReset({ email: "reader@example.test" })

        expect(lastDocument()).toContain("mutation RequestPasswordReset")
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})

describe("resetPassword", () => {
    it("forwards the reset to its matching operation and variables", async () => {
        await resetPassword({ token: "reset-token", newPassword: "new-correct-horse" })

        expect(lastDocument()).toContain("mutation ResetPassword")
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})

describe("refreshSession", () => {
    it("refreshes without sending an argument", async () => {
        // the credential is the cookie, so a refresh carries no argument at all
        await refreshSession()

        expect(lastDocument()).toContain("mutation RefreshSession")
        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(1)
    })
})
