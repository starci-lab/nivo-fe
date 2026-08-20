import { describe, expect, it, vi } from "vitest"

vi.mock("./graphql", () => ({ graphql: vi.fn() }))

import { graphql } from "./graphql"
import {
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
    signUp,
    signUpInit,
    signUpResend,
    signUpVerifyOtp,
    verifyTwoFactor,
} from "./auth"

describe("authentication API operations", () => {
    it("builds the provider redirect URL without nesting under graphql", () => {
        expect(oauthRedirectUrl("google", "http://localhost:3067/auth/callback?next=/app"))
            .toBe("http://localhost:3068/api/v1/keycloak/google/redirect?redirect_uri=http%3A%2F%2Flocalhost%3A3067%2Fauth%2Fcallback%3Fnext%3D%2Fapp")
    })

    it("forwards every credential journey to its matching operation and variables", async () => {
        vi.mocked(graphql).mockResolvedValue({ ok: true, data: {} } as never)
        const input = { email: "reader@example.test", password: "correct-horse" }
        const otp = { challengeId: "challenge-1", otp: "123456" }

        await signUpInit(input)
        await signUpResend({ challengeId: "challenge-1" })
        await signUpVerifyOtp(otp)
        await forgotPasswordInit({ email: input.email })
        await forgotPasswordResend({ challengeId: "reset-1" })
        await forgotPasswordVerifyOtp({ ...otp, newPassword: "new-correct-horse" })
        await signUp({ ...input, name: "Reader" })
        await signIn(input)
        await verifyTwoFactor({ twoFactorToken: "token-1", code: "123456" })
        await exchangeOauthCode({ code: "code-1", provider: "google", state: "state-1" })
        await requestPasswordReset({ email: input.email })
        await resetPassword({ token: "reset-token", newPassword: "new-correct-horse" })
        await refreshSession()
        await signOut()

        expect(vi.mocked(graphql)).toHaveBeenCalledTimes(14)
        const calls = vi.mocked(graphql).mock.calls
        expect(calls[0][0]).toContain("mutation SignUpInit")
        expect(calls[0][1]).toEqual({ input })
        expect(calls[7][0]).toContain("mutation SignIn")
        expect(calls[8][1]).toEqual({ input: { twoFactorToken: "token-1", code: "123456" } })
        expect(calls[12][0]).toContain("mutation RefreshSession")
        expect(calls[13][0]).toBe("mutation SignOut { signOut { data message success error } }")
    })
})
