import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { AuthActions, AuthCode, AuthDetails } from "@/components/blocks/auth/AuthenticationPanel"

const mocks = vi.hoisted(() => {
    const api = {
        exchangeOauthCode: vi.fn(),
        forgotPasswordInit: vi.fn(),
        forgotPasswordResend: vi.fn(),
        forgotPasswordVerifyOtp: vi.fn(),
        oauthRedirectUrl: vi.fn(() => "https://auth.test/redirect"),
        signIn: vi.fn(),
        signUpInit: vi.fn(),
        signUpResend: vi.fn(),
        signUpVerifyOtp: vi.fn(),
    }
    return {
        api,
        push: vi.fn(),
        adopt: vi.fn(),
        session: { state: { status: "anonymous" as string }, adopt: vi.fn() },
        t: (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
    }
})

type AuthProbePanel = {
    state: string
    props: Record<string, unknown>
    on?: AuthActions
}

type AuthPageProbeInput = { panel: AuthProbePanel }

const details = { email: "reader@example.test", password: "secret-password" } satisfies AuthDetails
const code = { otp: "123456", newPassword: "new-password" } satisfies AuthCode

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => mocks.t }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/auth", () => mocks.api)
vi.mock("./component", () => ({
    AuthenticationPageBase: (input: AuthPageProbeInput) => (
        <div>
            <output data-testid="auth-panel">{JSON.stringify({ state: input.panel.state, props: input.panel.props })}</output>
            <button data-testid="submit-details" onClick={() => input.panel.on?.submitDetails?.(details)}>details</button>
            <button data-testid="submit-code" onClick={() => input.panel.on?.submitCode?.(code)}>code</button>
            <button data-testid="resend" onClick={() => input.panel.on?.resend?.()}>resend</button>
            <button data-testid="back" onClick={() => input.panel.on?.back?.()}>back</button>
            <button data-testid="sign-in" onClick={() => input.panel.on?.changeMode?.("signIn")}>sign in</button>
            <button data-testid="sign-up" onClick={() => input.panel.on?.changeMode?.("signUp")}>sign up</button>
            <button data-testid="forgot" onClick={() => input.panel.on?.changeMode?.("forgotPassword")}>forgot</button>
            <button data-testid="remember" onClick={() => input.panel.on?.changeRememberMe?.(false)}>remember</button>
            <button data-testid="google" onClick={() => input.panel.on?.chooseProvider?.("google")}>google</button>
            <button data-testid="onward" onClick={() => input.panel.on?.onward?.()}>onward</button>
        </div>
    ),
}))

import { AuthenticationPage } from "./"

const panel = () => screen.getByTestId("auth-panel").textContent ?? ""

describe("AuthenticationPage connected journeys", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "anonymous" }
        mocks.api.signIn.mockResolvedValue({ ok: false, reason: "invalid" })
        mocks.api.signUpInit.mockResolvedValue({ ok: true, data: { challengeId: "challenge", expiresInSeconds: 300 } })
        mocks.api.signUpVerifyOtp.mockResolvedValue({ ok: true, data: { accessToken: "access" } })
        mocks.api.signUpResend.mockResolvedValue({ ok: true, data: { challengeId: "challenge-2", expiresInSeconds: 120 } })
        mocks.api.forgotPasswordInit.mockResolvedValue({ ok: true, data: { challengeId: "reset", expiresInSeconds: 180 } })
        mocks.api.forgotPasswordVerifyOtp.mockResolvedValue({ ok: true, data: true })
        mocks.api.forgotPasswordResend.mockResolvedValue({ ok: true, data: { challengeId: "reset-2", expiresInSeconds: 180 } })
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: false, reason: "oauth-failed" })
        window.history.replaceState(null, "", "/authentication")
        window.sessionStorage.clear()
    })

    it("handles sign-in refusal, remember-me and mode switching", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("remember"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain("invalid"))
        fireEvent.click(screen.getByTestId("sign-up"))
        expect(panel()).toContain("signUp.title")
        fireEvent.click(screen.getByTestId("sign-in"))
        expect(panel()).toContain("signIn.title")
    })

    it("completes sign-in and handles a two-factor response", async () => {
        mocks.api.signIn.mockResolvedValue({ ok: true, data: { accessToken: "access" } })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.session.adopt).toHaveBeenCalledWith({ accessToken: "access" })

        cleanup()
        mocks.api.signIn.mockResolvedValue({ ok: true, data: { requiresTwoFactor: true } })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"twoFactorUnsupported"'))
        fireEvent.click(screen.getByTestId("onward"))
        expect(panel()).toContain('"state":"details"')
    })

    it("completes sign-up, including resend, verify refusal and success", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        fireEvent.click(screen.getByTestId("resend"))
        await waitFor(() => expect(panel()).toContain("resentLabel"))
        mocks.api.signUpVerifyOtp.mockResolvedValue({ ok: false, reason: "used" })
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain("used"))
        mocks.api.signUpVerifyOtp.mockResolvedValue({ ok: true, data: { accessToken: "signup-access" } })
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.session.adopt).toHaveBeenCalledWith({ accessToken: "signup-access" })
    })

    it("completes reset, masks code refusal and returns onward to sign-in", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("forgot"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        mocks.api.forgotPasswordResend.mockResolvedValue({ ok: false, reason: "reset-resend-failed" })
        fireEvent.click(screen.getByTestId("resend"))
        await waitFor(() => expect(panel()).toContain("reset-resend-failed"))
        mocks.api.forgotPasswordVerifyOtp.mockResolvedValue({ ok: false, reason: "do-not-leak" })
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain("forgotPassword.codeRefused"))
        mocks.api.forgotPasswordVerifyOtp.mockResolvedValue({ ok: true, data: true })
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain('"state":"done"'))
        fireEvent.click(screen.getByTestId("onward"))
        expect(panel()).toContain("signIn.title")
        fireEvent.click(screen.getByTestId("back"))
        expect(panel()).toContain('"state":"details"')
    })

    it("reports initial and resend failures without leaving a stale challenge", async () => {
        mocks.api.signUpInit.mockResolvedValue({ ok: false, reason: "signup-init-failed" })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain("signup-init-failed"))

        cleanup()
        mocks.api.signUpInit.mockResolvedValue({ ok: true, data: { challengeId: "challenge", expiresInSeconds: 300 } })
        mocks.api.signUpResend.mockResolvedValue({ ok: false, reason: "resend-failed" })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        fireEvent.click(screen.getByTestId("resend"))
        await waitFor(() => expect(panel()).toContain("resend-failed"))
    })

    it("handles provider redirects and callback exchange outcomes", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("google"))
        expect(window.sessionStorage.getItem("nivo.oauth.provider")).toBe("google")
        expect(mocks.api.oauthRedirectUrl).toHaveBeenCalledWith("google", expect.stringContaining("/authentication"))

        cleanup()
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { accessToken: "oauth-access" } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.api.exchangeOauthCode).toHaveBeenCalledWith({ code: "abc", provider: "google", state: "xyz" })

        cleanup()
        window.history.replaceState(null, "", "/authentication?code=two-factor&state=two-factor-state")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { requiresTwoFactor: true } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain('"state":"twoFactorUnsupported"'))

        cleanup()
        window.history.replaceState(null, "", "/authentication?code=bad&state=bad-state")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: false, reason: "oauth-failed" })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain("oauth-failed"))

        cleanup()
        window.history.replaceState(null, "", "/authentication?error=cancelled")
        render(<AuthenticationPage />)
        expect(panel()).toContain('"state":"details"')
    })
})