import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("./graphql", () => ({ graphql: vi.fn() }))

import { graphql } from "./graphql"
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
} from "./auth"

/** The document of the one call the operation under test just made. */
const lastDocument = () => vi.mocked(graphql).mock.calls.at(-1)?.[0] ?? ""
/** The variables of the one call the operation under test just made. */
const lastVariables = () => vi.mocked(graphql).mock.calls.at(-1)?.[1]

describe("authentication API operations", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(graphql).mockResolvedValue({ ok: true, data: {} } as never)
    })

    it("builds the provider redirect URL without nesting under graphql", () => {
        expect(oauthRedirectUrl("google", "http://localhost:3067/auth/callback?next=/app"))
            .toBe("http://localhost:3068/api/v1/keycloak/google/redirect?redirect_uri=http%3A%2F%2Flocalhost%3A3067%2Fauth%2Fcallback%3Fnext%3D%2Fapp")
    })

    it("does not publish the withdrawn public signUp mutation", async () => {
        /*
         * NO DOOR CREATES AN IDENTITY BEFORE A CONSUMED PROOF. The bypass was removed from the
         * backend schema, so an adapter document for it could only ever answer a GraphQL error.
         */
        const published = await import("./auth")
        expect("signUp" in published).toBe(false)
    })

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

    it("asks a registration completion for its conclusion and undecided result", async () => {
        await signUpVerifyOtp({ challengeId: "challenge-1", otp: "123456" })

        expect(lastDocument()).toContain("mutation SignUpVerifyOtp")
        // the reason is the whole instruction for what the screen offers next
        expect(lastDocument()).toContain("conclusion { reason }")
        expect(lastDocument()).toContain("undecided { retryWithSameRequest }")
        expect(lastVariables()).toEqual({ input: { challengeId: "challenge-1", otp: "123456" } })
    })

    it("asks a brokered completion for its continuation reference and the provider-email refusal", async () => {
        await exchangeOauthCode({ code: "code-1", provider: "google", state: "state-1" })

        expect(lastDocument()).toContain("mutation ExchangeOauthCode")
        expect(lastDocument()).toContain("undecided { continuationReference }")
        expect(lastDocument()).toContain("providerEmailRefused")
        expect(lastVariables()).toEqual({
            input: { code: "code-1", provider: "google", state: "state-1" },
        })
    })

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

    it("signs out of this browser without sending a scope", async () => {
        await signOut()

        expect(lastDocument()).toContain("mutation SignOut")
        // the scope input is nullable, so returning to this browser sends no variable at all
        expect(lastVariables()).toBeUndefined()
    })

    it("signs out everywhere by sending the scope the door reads", async () => {
        await signOut({ scope: "everywhere" })

        expect(lastVariables()).toEqual({ input: { scope: "everywhere" } })
    })

    it("ends a named principal's sessions under the authority context it was given", async () => {
        await endPrincipalSessions({
            requestId: "ending-1",
            targetPrincipal: "principal-1",
            workspaceId: "workspace-1",
        })

        expect(lastDocument()).toContain("mutation EndPrincipalSessions")
        // one shape carries all three answers, told apart by kind alone
        expect(lastDocument()).toContain("data { kind authorityEndingConfirmed }")
        expect(lastVariables()).toEqual({
            input: {
                requestId: "ending-1",
                targetPrincipal: "principal-1",
                workspaceId: "workspace-1",
            },
        })
    })

    it("forwards every remaining credential journey to its matching operation and variables", async () => {
        const input = { email: "reader@example.test", password: "correct-horse" }
        const otp = { challengeId: "challenge-1", otp: "123456" }

        await signUpInit(input)
        expect(lastDocument()).toContain("mutation SignUpInit")
        expect(lastVariables()).toEqual({ input })

        await signUpResend({ challengeId: "challenge-1" })
        expect(lastDocument()).toContain("mutation SignUpResend")

        await forgotPasswordInit({ email: input.email })
        expect(lastDocument()).toContain("mutation ForgotPasswordInit")

        await forgotPasswordResend({ challengeId: "reset-1" })
        expect(lastDocument()).toContain("mutation ForgotPasswordResend")

        // setting a password is not signing in, so this one answers a boolean and no session is read
        await forgotPasswordVerifyOtp({ ...otp, newPassword: "new-correct-horse" })
        expect(lastDocument()).toContain("mutation ForgotPasswordVerifyOtp")
        expect(lastVariables()).toEqual({
            input: { challengeId: "challenge-1", otp: "123456", newPassword: "new-correct-horse" },
        })

        await verifyTwoFactor({ twoFactorToken: "token-1", code: "123456" })
        expect(lastDocument()).toContain("mutation VerifyTwoFactor")
        expect(lastVariables()).toEqual({
            input: { twoFactorToken: "token-1", code: "123456" },
        })

        await requestPasswordReset({ email: input.email })
        expect(lastDocument()).toContain("mutation RequestPasswordReset")

        await resetPassword({ token: "reset-token", newPassword: "new-correct-horse" })
        expect(lastDocument()).toContain("mutation ResetPassword")

        // the credential is the cookie, so a refresh carries no argument at all
        await refreshSession()
        expect(lastDocument()).toContain("mutation RefreshSession")

        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(9)
    })
})