import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import en from "@/messages/en.json"
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
    }
})

type AuthProbePanel = {
    state: string
    props: Record<string, unknown>
    on?: AuthActions
}

type AuthPageProbeInput = { panel: AuthProbePanel; exits: ReadonlyArray<{ question: string; action: string }> }

const details = { email: "reader@example.test", password: "secret-password", name: "Reader" } satisfies AuthDetails
const code = { otp: "123456", newPassword: "new-password" } satisfies AuthCode

vi.mock("@/hooks/i18n/useRouter", () => ({ useRouter: () => ({ push: mocks.push, replace: mocks.replace }) }))
vi.mock("@/hooks/i18n/usePathname", () => ({ usePathname: () => "/authentication" }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(window.location.search),
    redirect: vi.fn(),
    permanentRedirect: vi.fn(),
}))
vi.mock("@/hooks", async (importOriginal) => ({
    ...(await importOriginal()),
    useSession: () => mocks.session,
    useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
    usePathname: () => "/authentication",
}))
vi.mock("@/modules/api/auth", () => mocks.api)
vi.mock("./component", () => ({
    AuthenticationPageView: (input: AuthPageProbeInput) => (
        <div>
            <output data-testid="auth-panel">
                {JSON.stringify({ state: input.panel.state, props: input.panel.props })}
            </output>
            <output data-testid="auth-exits">{JSON.stringify(input.exits)}</output>
            <button data-testid="submit-details" onClick={() => input.panel.on?.submitDetails?.(details)}>
                details
            </button>
            <button data-testid="submit-code" onClick={() => input.panel.on?.submitCode?.(code)}>
                code
            </button>
            <button data-testid="submit-factor" onClick={() => input.panel.on?.submitFactor?.({ code: "123456" })}>
                factor
            </button>
            <button data-testid="resend" onClick={() => input.panel.on?.resend?.()}>
                resend
            </button>
            <button data-testid="back" onClick={() => input.panel.on?.back?.()}>
                back
            </button>
            <button data-testid="sign-in" onClick={() => input.panel.on?.changeMode?.("signIn")}>
                sign in
            </button>
            <button data-testid="sign-up" onClick={() => input.panel.on?.changeMode?.("signUp")}>
                sign up
            </button>
            <button data-testid="forgot" onClick={() => input.panel.on?.changeMode?.("forgotPassword")}>
                forgot
            </button>
            <button data-testid="remember" onClick={() => input.panel.on?.changeRememberMe?.(false)}>
                remember
            </button>
            <button data-testid="google" onClick={() => input.panel.on?.chooseProvider?.("google")}>
                google
            </button>
            <button data-testid="onward" onClick={() => input.panel.on?.onward?.()}>
                onward
            </button>
            <button data-testid="onward-secondary" onClick={() => input.panel.on?.onwardSecondary?.()}>
                onward secondary
            </button>
        </div>
    ),
}))

import { AuthenticationPage } from "./"

/** The real English copy of the authentication namespace, escaped the way the probe serialises it into JSON. */
const copy = (key: string): string => {
    const text = key
        .split(".")
        .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], en.authentication)
    if (typeof text !== "string") throw new Error(`authentication.${key} is not a catalog message`)
    return JSON.stringify(text).slice(1, -1)
}
const panel = () => screen.getByTestId("auth-panel").textContent ?? ""
const exits = () => screen.getByTestId("auth-exits").textContent ?? ""

describe("AuthenticationPage connected journeys", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "anonymous" }
        mocks.api.signIn.mockResolvedValue({ ok: false, reason: "invalid", code: "INVALID_CREDENTIALS" })
        mocks.api.verifyTwoFactor.mockResolvedValue({
            ok: true,
            data: { accessToken: "two-factor-access", requiresTwoFactor: false, twoFactorToken: null },
        })
        mocks.api.signUpInit.mockResolvedValue({ ok: true, data: { challengeId: "challenge", expiresInSeconds: 300 } })
        mocks.api.signUpVerifyOtp.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                conclusion: null,
                undecided: null,
            },
        })
        mocks.api.signUpResend.mockResolvedValue({
            ok: true,
            data: { challengeId: "challenge-2", expiresInSeconds: 120 },
        })
        mocks.api.forgotPasswordInit.mockResolvedValue({
            ok: true,
            data: { challengeId: "reset", expiresInSeconds: 180 },
        })
        mocks.api.forgotPasswordVerifyOtp.mockResolvedValue({ ok: true, data: true })
        mocks.api.forgotPasswordResend.mockResolvedValue({
            ok: true,
            data: { challengeId: "reset-2", expiresInSeconds: 180 },
        })
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: false, reason: "oauth-failed" })
        mocks.api.continueBrokeredSignIn.mockResolvedValue({ ok: false, reason: "oauth-failed" })
        window.history.replaceState(null, "", "/authentication")
        window.sessionStorage.clear()
    })

    it("completes sign-in and handles a two-factor response", async () => {
        mocks.api.signIn.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                destination: "/overview",
                undecided: null,
            },
        })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.session.adopt).toHaveBeenCalledWith({
            accessToken: "access",
            requiresTwoFactor: false,
            twoFactorToken: null,
            destination: "/overview",
            undecided: null,
        })

        cleanup()
        mocks.api.signIn.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: true,
                twoFactorToken: "two-factor-token",
                destination: null,
                undecided: null,
            },
        })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"secondFactor"'))
        fireEvent.click(screen.getByTestId("onward"))
        expect(panel()).toContain('"state":"details"')
    })

    it("completes reset, masks code refusal and returns onward to sign-in", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("forgot"))
        expect(panel()).toContain(`"submitLabel":"${copy("signUp.submitLabel")}"`)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        mocks.api.forgotPasswordResend.mockResolvedValue({ ok: false, reason: "reset-resend-failed" })
        fireEvent.click(screen.getByTestId("resend"))
        await waitFor(() => expect(panel()).toContain(copy("resendRefused")))
        mocks.api.forgotPasswordVerifyOtp.mockResolvedValue({ ok: false, reason: "do-not-leak" })
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain(copy("forgotPassword.codeRefused")))
        mocks.api.forgotPasswordVerifyOtp.mockResolvedValue({ ok: true, data: true })
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain('"state":"done"'))
        fireEvent.click(screen.getByTestId("onward"))
        expect(panel()).toContain(copy("signIn.title"))
        fireEvent.click(screen.getByTestId("back"))
        expect(panel()).toContain('"state":"details"')
    })

    it("reports initial and resend failures without leaving a stale challenge", async () => {
        mocks.api.signUpInit.mockResolvedValue({ ok: false, reason: "signup-init-failed", code: "MAIL_REFUSED" })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain(copy("signUp.mailRefused")))
        expect(panel()).toContain('"state":"details"')

        cleanup()
        mocks.api.signUpInit.mockResolvedValue({ ok: true, data: { challengeId: "challenge", expiresInSeconds: 300 } })
        mocks.api.signUpResend.mockResolvedValue({ ok: false, reason: "resend-failed" })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        fireEvent.click(screen.getByTestId("resend"))
        await waitFor(() => expect(panel()).toContain(copy("resendRefused")))
    })

    it("handles provider redirects and callback exchange outcomes", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("google"))
        expect(window.sessionStorage.getItem("nivo.oauth.provider")).toBe("google")
        expect(mocks.api.oauthRedirectUrl).toHaveBeenCalledWith("google", expect.stringContaining("/authentication"))
        await waitFor(() => expect(panel()).toContain('"pendingAction":"provider"'))

        cleanup()
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "oauth-access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                providerEmailRefused: null,
                undecided: null,
            },
        })
        render(<AuthenticationPage />)
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.api.exchangeOauthCode).toHaveBeenCalledWith({ code: "abc", provider: "google", state: "xyz" })

        cleanup()
        window.history.replaceState(null, "", "/authentication?code=two-factor&state=two-factor-state")
        mocks.api.exchangeOauthCode.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: true,
                twoFactorToken: "oauth-two-factor",
                providerEmailRefused: null,
                undecided: null,
            },
        })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain('"state":"secondFactor"'))

        cleanup()
        window.history.replaceState(null, "", "/authentication?code=bad&state=bad-state")
        mocks.api.exchangeOauthCode.mockResolvedValue({ ok: false, reason: "oauth-failed" })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain(copy("signIn.oauthRefused")))

        cleanup()
        window.history.replaceState(null, "", "/authentication?error=cancelled")
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain(copy("signIn.oauthRefused")))
        expect(panel()).toContain('"state":"details"')
    })

    it("returns a signed-in reader to the console route that interrupted them", async () => {
        mocks.api.signIn.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                destination: null,
                undecided: null,
            },
        })
        window.history.replaceState(
            null,
            "",
            "/authentication?returnTo=%2Fagentos%2Fworkspaces%2Fw1%2Fmodules%2Fm1%2Fsetup",
        )
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
        mocks.api.exchangeOauthCode.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "oauth-access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                providerEmailRefused: null,
                undecided: null,
            },
        })
        render(<AuthenticationPage />)
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/w1"))
    })

    it("never follows a return address off this origin", async () => {
        mocks.api.signIn.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                destination: null,
                undecided: null,
            },
        })
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
        mocks.api.signIn.mockResolvedValue({ ok: false, kind: "unavailable", reason: "gateway", code: "NETWORK" })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain(copy("signIn.undecided")))
        expect(panel()).not.toContain(copy("signIn.refused"))
        expect(panel()).toContain('"isError":false')

        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.api.signIn).toHaveBeenCalledTimes(2))
        const unanswered = mocks.api.signIn.mock.calls[0]![0]
        expect(unanswered.requestIdentity).toBeDefined()
        expect(mocks.api.signIn.mock.calls[1]![0].requestIdentity).toBe(unanswered.requestIdentity)

        // An UNDECIDED ANSWER is the same non-refusal, continued under the same identity.
        mocks.api.signIn.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: false,
                twoFactorToken: null,
                destination: null,
                undecided: { retryWithSameRequest: true },
            },
        })
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.api.signIn).toHaveBeenCalledTimes(3))
        expect(panel()).toContain(copy("signIn.undecided"))
        expect(mocks.api.signIn.mock.calls[2]![0].requestIdentity).toBe(unanswered.requestIdentity)

        // A REFUSAL settles the attempt, so the next press is a new logical request.
        mocks.api.signIn.mockResolvedValue({ ok: false, reason: "invalid", code: "INVALID_CREDENTIALS" })
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain(copy("signIn.refused")))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(mocks.api.signIn).toHaveBeenCalledTimes(5))
        const refused = mocks.api.signIn.mock.calls[4]![0]
        expect(refused.requestIdentity).not.toBe(unanswered.requestIdentity)
    })

    it("has no axe violations", async () => {
        vi.resetModules()
        vi.doMock("./component", async () => await vi.importActual("./component"))
        const { AuthenticationPage: ConnectedAuthenticationPage } = await import("./")
        const { container } = render(<ConnectedAuthenticationPage />)
        await screen.findByRole("main")
        await expectNoA11yViolations(container)
        vi.doUnmock("./component")
    })
})
