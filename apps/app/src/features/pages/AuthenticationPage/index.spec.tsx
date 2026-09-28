import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { AuthActions, AuthCode, AuthDetails } from "@/components/blocks/auth/AuthenticationPanel"

const mocks = vi.hoisted(() => {
    const api = {
        exchangeOauthCode: vi.fn(),
        continueBrokeredSignIn: vi.fn(),
        forgotPasswordInit: vi.fn(),
        forgotPasswordResend: vi.fn(),
        forgotPasswordVerifyOtp: vi.fn(),
        oauthRedirectUrl: vi.fn(() => "https://auth.test/redirect"),
        signIn: vi.fn(),
        signOut: vi.fn(),
        verifyTwoFactor: vi.fn(),
        signUpInit: vi.fn(),
        signUpResend: vi.fn(),
        signUpVerifyOtp: vi.fn(),
    }
    return {
        api,
        push: vi.fn(),
        replace: vi.fn(),
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

type AuthPageProbeInput = { panel: AuthProbePanel, exits: ReadonlyArray<{ question: string, action: string }> }

const details = { email: "reader@example.test", password: "secret-password", name: "Reader" } satisfies AuthDetails
const code = { otp: "123456", newPassword: "new-password" } satisfies AuthCode

vi.mock("@/hooks/i18n/useRouter", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }))
vi.mock("@/hooks/i18n/usePathname", () => ({ usePathname: () => "/authentication" }))
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(window.location.search), redirect: vi.fn(), permanentRedirect: vi.fn() }))
vi.mock("next-intl", () => ({ useTranslations: () => mocks.t }))
vi.mock("@/hooks", async (importOriginal) => ({ ...await importOriginal(), useSession: () => mocks.session, useRouter: () => ({ push: mocks.push, replace: mocks.replace }), usePathname: () => "/authentication" }))
vi.mock("@/modules/api/auth", () => mocks.api)
vi.mock("./component", () => ({
    AuthenticationPageView: (input: AuthPageProbeInput) => (
        <div>
            <output data-testid="auth-panel">{JSON.stringify({ state: input.panel.state, props: input.panel.props })}</output>
            <output data-testid="auth-exits">{JSON.stringify(input.exits)}</output>
            <button data-testid="submit-details" onClick={() => input.panel.on?.submitDetails?.(details)}>details</button>
            <button data-testid="submit-code" onClick={() => input.panel.on?.submitCode?.(code)}>code</button>
            <button data-testid="submit-factor" onClick={() => input.panel.on?.submitFactor?.({ code: "123456" })}>factor</button>
            <button data-testid="resend" onClick={() => input.panel.on?.resend?.()}>resend</button>
            <button data-testid="back" onClick={() => input.panel.on?.back?.()}>back</button>
            <button data-testid="sign-in" onClick={() => input.panel.on?.changeMode?.("signIn")}>sign in</button>
            <button data-testid="sign-up" onClick={() => input.panel.on?.changeMode?.("signUp")}>sign up</button>
            <button data-testid="forgot" onClick={() => input.panel.on?.changeMode?.("forgotPassword")}>forgot</button>
            <button data-testid="remember" onClick={() => input.panel.on?.changeRememberMe?.(false)}>remember</button>
            <button data-testid="google" onClick={() => input.panel.on?.chooseProvider?.("google")}>google</button>
            <button data-testid="onward" onClick={() => input.panel.on?.onward?.()}>onward</button>
            <button data-testid="onward-secondary" onClick={() => input.panel.on?.onwardSecondary?.()}>onward secondary</button>
        </div>
    ),
}))

import { AuthenticationPage } from "./"

const panel = () => screen.getByTestId("auth-panel").textContent ?? ""
const exits = () => screen.getByTestId("auth-exits").textContent ?? ""

describe("AuthenticationPage connected journeys", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "anonymous" }
        mocks.api.signIn.mockResolvedValue({ ok: false, reason: "invalid", code: "INVALID_CREDENTIALS" })
        mocks.api.verifyTwoFactor.mockResolvedValue({ ok: true, data: { accessToken: "two-factor-access", requiresTwoFactor: false, twoFactorToken: null } })
        mocks.api.signUpInit.mockResolvedValue({ ok: true, data: { challengeId: "challenge", expiresInSeconds: 300 } })
        mocks.api.signUpVerifyOtp.mockResolvedValue({ ok: true, data: { accessToken: "access", requiresTwoFactor: false, twoFactorToken: null, conclusion: null, undecided: null } })
        mocks.api.signUpResend.mockResolvedValue({ ok: true, data: { challengeId: "challenge-2", expiresInSeconds: 120 } })
        mocks.api.forgotPasswordInit.mockResolvedValue({ ok: true, data: { challengeId: "reset", expiresInSeconds: 180 } })
        mocks.api.forgotPasswordVerifyOtp.mockResolvedValue({ ok: true, data: true })
        mocks.api.forgotPasswordResend.mockResolvedValue({ ok: true, data: { challengeId: "reset-2", expiresInSeconds: 180 } })
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: false, reason: "oauth-failed" })
        mocks.api.continueBrokeredSignIn.mockResolvedValue({ ok: false, reason: "oauth-failed" })
        window.history.replaceState(null, "", "/authentication")
        window.sessionStorage.clear()
    })

    it("handles sign-in refusal, remember-me and mode switching", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("remember"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain("signIn.refused"))
        fireEvent.click(screen.getByTestId("sign-up"))
        expect(panel()).toContain("signUp.title")
        fireEvent.click(screen.getByTestId("sign-in"))
        expect(panel()).toContain("signIn.title")
    })

    it("completes sign-in and handles a two-factor response", async () => {
        mocks.api.signIn.mockResolvedValue({ ok: true, data: { accessToken: "access", requiresTwoFactor: false, twoFactorToken: null, destination: "/overview", undecided: null } })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.session.adopt).toHaveBeenCalledWith({ accessToken: "access", requiresTwoFactor: false, twoFactorToken: null, destination: "/overview", undecided: null })

        cleanup()
        mocks.api.signIn.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: true, twoFactorToken: "two-factor-token", destination: null, undecided: null } })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"secondFactor"'))
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
        mocks.api.signUpVerifyOtp.mockResolvedValue({ ok: false, reason: "used", code: "OTP_INVALID" })
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain("signUp.codeRefused"))
        mocks.api.signUpVerifyOtp.mockResolvedValue({ ok: true, data: { accessToken: "signup-access", requiresTwoFactor: false, twoFactorToken: null, conclusion: null, undecided: null } })
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain('"state":"done"'))
        expect(mocks.session.adopt).toHaveBeenCalledWith({ accessToken: "signup-access", requiresTwoFactor: false, twoFactorToken: null, conclusion: null, undecided: null })
        fireEvent.click(screen.getByTestId("onward"))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
    })

    it("completes reset, masks code refusal and returns onward to sign-in", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("forgot"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        mocks.api.forgotPasswordResend.mockResolvedValue({ ok: false, reason: "reset-resend-failed" })
        fireEvent.click(screen.getByTestId("resend"))
        await waitFor(() => expect(panel()).toContain("resendRefused"))
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
        mocks.api.signUpInit.mockResolvedValue({ ok: false, reason: "signup-init-failed", code: "MAIL_REFUSED" })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain("signUp.mailRefused"))
        expect(panel()).toContain('"state":"details"')

        cleanup()
        mocks.api.signUpInit.mockResolvedValue({ ok: true, data: { challengeId: "challenge", expiresInSeconds: 300 } })
        mocks.api.signUpResend.mockResolvedValue({ ok: false, reason: "resend-failed" })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        fireEvent.click(screen.getByTestId("resend"))
        await waitFor(() => expect(panel()).toContain("resendRefused"))
    })

    it("handles provider redirects and callback exchange outcomes", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("google"))
        expect(window.sessionStorage.getItem("nivo.oauth.provider")).toBe("google")
        expect(mocks.api.oauthRedirectUrl).toHaveBeenCalledWith("google", expect.stringContaining("/authentication"))
        await waitFor(() => expect(panel()).toContain('"pendingAction":"provider"'))
        expect(panel()).not.toContain("providerUnavailable")

        cleanup()
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { accessToken: "oauth-access", requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: null, undecided: null } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.api.exchangeOauthCode).toHaveBeenCalledWith({ code: "abc", provider: "google", state: "xyz" })

        cleanup()
        window.history.replaceState(null, "", "/authentication?code=two-factor&state=two-factor-state")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: true, twoFactorToken: "oauth-two-factor", providerEmailRefused: null, undecided: null } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain('"state":"secondFactor"'))

        cleanup()
        window.history.replaceState(null, "", "/authentication?code=bad&state=bad-state")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: false, reason: "oauth-failed" })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain("signIn.oauthRefused"))

        cleanup()
        window.history.replaceState(null, "", "/authentication?error=cancelled")
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain("signIn.oauthRefused"))
        expect(panel()).toContain('"state":"details"')
    })

    it("returns a signed-in reader to the console route that interrupted them", async () => {
        mocks.api.signIn.mockResolvedValue({ ok: true, data: { accessToken: "access", requiresTwoFactor: false, twoFactorToken: null, destination: null, undecided: null } })
        window.history.replaceState(null, "", "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fw1%2Fmodules%2Fm1%2Fsetup")
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/w1/modules/m1/setup"))
        expect(window.sessionStorage.getItem("nivo.auth.return-to")).toBeNull()

        cleanup()
        window.history.replaceState(null, "", "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fw1")
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("google"))
        expect(window.sessionStorage.getItem("nivo.auth.return-to")).toBe("/agentos/workspaces/w1")

        cleanup()
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { accessToken: "oauth-access", requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: null, undecided: null } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/w1"))
    })

    it("never follows a return address off this origin", async () => {
        mocks.api.signIn.mockResolvedValue({ ok: true, data: { accessToken: "access", requiresTwoFactor: false, twoFactorToken: null, destination: null, undecided: null } })
        for (const bad of ["https%3A%2F%2Fevil.test%2F", "%2F%2Fevil.test", "%2Fagentos%20x"]) {
            cleanup()
            window.sessionStorage.clear()
            window.history.replaceState(null, "", `/authentication?returnTo=${bad}`)
            render(<AuthenticationPage />)
            fireEvent.click(screen.getByTestId("submit-details"))
            await waitFor(() => expect(mocks.push).toHaveBeenLastCalledWith("/overview"))
        }
    })

    it("separates an undecided sign-in from a refusal and keeps one request identity across the retry", async () => {
        mocks.api.signIn.mockResolvedValue({ ok: false, reason: "gateway", code: "NETWORK" })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain("signIn.undecided"))
        expect(panel()).not.toContain("signIn.refused")
        expect(panel()).toContain('"isError":false')

        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.api.signIn).toHaveBeenCalledTimes(2))
        const unanswered = mocks.api.signIn.mock.calls[0][0]
        expect(unanswered.requestIdentity).toBeDefined()
        expect(mocks.api.signIn.mock.calls[1][0].requestIdentity).toBe(unanswered.requestIdentity)

        // An UNDECIDED ANSWER is the same non-refusal, continued under the same identity.
        mocks.api.signIn.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: false, twoFactorToken: null, destination: null, undecided: { retryWithSameRequest: true } } })
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.api.signIn).toHaveBeenCalledTimes(3))
        expect(panel()).toContain("signIn.undecided")
        expect(mocks.api.signIn.mock.calls[2][0].requestIdentity).toBe(unanswered.requestIdentity)

        // A REFUSAL settles the attempt, so the next press is a new logical request.
        mocks.api.signIn.mockResolvedValue({ ok: false, reason: "invalid", code: "INVALID_CREDENTIALS" })
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain("signIn.refused"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.api.signIn).toHaveBeenCalledTimes(5))
        const refused = mocks.api.signIn.mock.calls[4][0]
        expect(refused.requestIdentity).not.toBe(unanswered.requestIdentity)
    })

    it("draws the way back from a challenge and the other journey below the surface", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        expect(exits()).toContain("backLabel")
        expect(exits()).toContain("signUp.promptAction")

        fireEvent.click(screen.getByTestId("back"))
        await waitFor(() => expect(panel()).toContain('"state":"details"'))
        expect(panel()).toContain('"mode":"signUp"')
    })

    it("shows the proven-holder notice with both ways out and creates no session", async () => {
        const arrivedAtHeldAddress = async () => {
            mocks.api.signUpVerifyOtp.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: false, twoFactorToken: null, conclusion: { reason: "heldAddress" }, undecided: null } })
            render(<AuthenticationPage />)
            fireEvent.click(screen.getByTestId("sign-up"))
            fireEvent.click(screen.getByTestId("submit-details"))
            await waitFor(() => expect(panel()).toContain('"state":"code"'))
            fireEvent.click(screen.getByTestId("submit-code"))
            await waitFor(() => expect(panel()).toContain('"state":"notice"'))
        }
        await arrivedAtHeldAddress()
        expect(panel()).toContain("signUp.heldAddressTitle")
        expect(panel()).toContain("signUp.emailTaken")
        expect(panel()).toContain("signUp.heldAddressRecoverLabel")
        expect(exits()).toBe("[]")
        expect(mocks.session.adopt).not.toHaveBeenCalled()
        expect(mocks.push).not.toHaveBeenCalled()

        fireEvent.click(screen.getByTestId("onward-secondary"))
        await waitFor(() => expect(panel()).toContain("forgotPassword.title"))

        cleanup()
        await arrivedAtHeldAddress()
        fireEvent.click(screen.getByTestId("onward"))
        await waitFor(() => expect(panel()).toContain("signIn.title"))
    })

    it("explains an identity created with no session and offers the password just set", async () => {
        mocks.api.signUpVerifyOtp.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: false, twoFactorToken: null, conclusion: { reason: "registeredSignInRequired" }, undecided: null } })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain('"state":"notice"'))
        expect(panel()).toContain("signUp.createdNoSessionNotice")
        expect(panel()).toContain("signUp.createdNoSessionSignInLabel")
        expect(panel()).toContain('"secondaryLabel":""')
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    it("keeps both provider paths fresh after an unverified-email refusal", async () => {
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: true, undecided: null } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain("signIn.oauthEmailRefused"))
        expect(panel()).toContain('"state":"details"')
        expect(panel()).toContain('"mode":"signIn"')
        expect(exits()).toContain("signIn.promptAction")
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    it("continues a brokered undecided result under its reference and never resends the spent callback", async () => {
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: null, undecided: { continuationReference: "hold-1" } } })
        mocks.api.continueBrokeredSignIn.mockResolvedValue({ ok: true, data: { accessToken: "continued-access", requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: null, undecided: null } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(mocks.api.continueBrokeredSignIn).toHaveBeenCalledWith({ continuationReference: "hold-1" }))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.session.adopt).toHaveBeenCalledWith({ accessToken: "continued-access", requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: null, undecided: null })
        expect(mocks.api.exchangeOauthCode).toHaveBeenCalledTimes(1)
        expect(mocks.api.continueBrokeredSignIn).toHaveBeenCalledTimes(1)
        expect(panel()).not.toContain("signIn.oauthUndecided")
    })

    it("reports a brokered undecided result as a try-again when nothing could be held", async () => {
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: null, undecided: { continuationReference: null } } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain("signIn.oauthUndecided"))
        expect(panel()).not.toContain("signIn.oauthRefused")
        expect(panel()).toContain('"isError":false')
        expect(mocks.api.exchangeOauthCode).toHaveBeenCalledTimes(1)
        expect(mocks.api.continueBrokeredSignIn).not.toHaveBeenCalled()
    })

    it("asks for nothing further when the continuation itself comes back undecided", async () => {
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: null, undecided: { continuationReference: "hold-lapsed" } } })
        mocks.api.continueBrokeredSignIn.mockResolvedValue({ ok: true, data: { accessToken: null, requiresTwoFactor: false, twoFactorToken: null, providerEmailRefused: null, undecided: { retryWithSameRequest: true } } })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain("signIn.oauthUndecided"))
        expect(panel()).not.toContain("signIn.oauthRefused")
        expect(mocks.api.continueBrokeredSignIn).toHaveBeenCalledTimes(1)
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    it("hands an unavailable requested place to the landing instead of parking it on the auth surface", async () => {
        mocks.api.signIn.mockResolvedValue({ ok: true, data: { accessToken: "access", requiresTwoFactor: false, twoFactorToken: null, destination: "/overview", undecided: null } })
        window.history.replaceState(null, "", "/authentication?returnTo=%2Fagentos%2Fsecret")
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        /*
         * THE SESSION IS KEPT AND THE SIGN-IN SURFACE IS LEFT. The asked-for route is never echoed -
         * not in the address and not into a notice here - and the reasonless notice belongs to the
         * default landing, which reads the marker once and drops it from its own address.
         */
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview?returnNotice=unavailable"))
        expect(mocks.session.adopt).toHaveBeenCalled()
        expect(panel()).toContain('"state":"details"')
        expect(panel()).not.toContain("unavailableReturnNotice")
        expect(panel()).not.toContain("agentos")
    })

    it("reports the handed-off session ending once, drops the param and keeps sign-in one press away", async () => {
        // APPLIED: the authority confirmed every browser, and the notice may say so.
        window.history.replaceState(null, "", "/authentication?sessionEnding=applied")
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain('"state":"notice"'))
        expect(panel()).toContain("signOut.everywhereAppliedNotice")
        expect(mocks.replace).toHaveBeenCalledWith("/authentication")
        expect(mocks.session.adopt).not.toHaveBeenCalled()
        expect(mocks.push).not.toHaveBeenCalled()

        fireEvent.click(screen.getByTestId("onward"))
        await waitFor(() => expect(panel()).toContain("signIn.title"))

        // UNCONFIRMED: this browser is out and the others were never confirmed - no completion claim.
        cleanup()
        window.history.replaceState(null, "", "/authentication?sessionEnding=unconfirmed")
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain('"state":"notice"'))
        expect(panel()).toContain("signOut.unconfirmedNotice")
        expect(panel()).not.toContain("everywhereAppliedNotice")

        // AN UNRECOGNISED VALUE is not an answer: no notice, and the param is still consumed.
        cleanup()
        window.history.replaceState(null, "", "/authentication?sessionEnding=something-else")
        render(<AuthenticationPage />)
        await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/authentication"))
        expect(panel()).toContain('"state":"details"')
        expect(panel()).not.toContain("signOut.")
    })

    it("catches a session ending that lands after mount, announces it once, and drops the param", async () => {
        /*
         * The hand-off's own timing: the custody guard's bare redirect mounts this page first, and
         * the confirmation's navigation appends the answer a moment later. A reader that only
         * sampled the address at mount would miss it entirely - this one must still see it, once.
         */
        const { rerender } = render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain('"state":"details"'))

        // the confirmation's hand-off lands on the address a moment after the page mounted
        window.history.replaceState(null, "", "/authentication?sessionEnding=unconfirmed")
        rerender(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain('"state":"notice"'))
        expect(panel()).toContain("signOut.unconfirmedNotice")
        expect(mocks.replace).toHaveBeenCalledWith("/authentication")
        expect(mocks.replace).toHaveBeenCalledTimes(1)

        // the param still sits on the test's static address; a re-render must not re-announce it
        rerender(<AuthenticationPage />)
        expect(mocks.replace).toHaveBeenCalledTimes(1)
        expect(panel()).toContain("signOut.unconfirmedNotice")
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })
})
