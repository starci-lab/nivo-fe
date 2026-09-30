import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import en from "@/messages/en.json"
import type { AuthActions, AuthCode, AuthDetails } from "@/components/blocks/auth/AuthenticationPanel"
import { authenticationExitsFor } from "./journeys"

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

describe("authenticationExitsFor", () => {
    it("projects the code back action and mode switch for one journey", () => {
        const clear = vi.fn()
        const changeMode = vi.fn()
        const projected = authenticationExitsFor({
            mode: "signIn",
            phase: "code",
            isRestoring: false,
            isSignedInArrival: false,
            translate: (key) => key,
            clear,
            changeMode,
        })

        expect(projected.map((exit) => exit.action)).toEqual(["backLabel", "signIn.promptAction"])
        projected[0]?.onPress()
        projected[1]?.onPress()
        expect(clear).toHaveBeenCalledOnce()
        expect(changeMode).toHaveBeenCalledWith("signUp")
    })
})

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

    it("draws the way back from a challenge and the other journey below the surface", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        expect(exits()).toContain(copy("backLabel"))
        expect(exits()).toContain(copy("signUp.promptAction"))

        fireEvent.click(screen.getByTestId("back"))
        await waitFor(() => expect(panel()).toContain('"state":"details"'))
        expect(panel()).toContain('"mode":"signUp"')
    })

    it("shows the proven-holder notice with both ways out and creates no session", async () => {
        const arrivedAtHeldAddress = async () => {
            mocks.api.signUpVerifyOtp.mockResolvedValue({
                ok: true,
                data: {
                    accessToken: null,
                    requiresTwoFactor: false,
                    twoFactorToken: null,
                    conclusion: { reason: "heldAddress" },
                    undecided: null,
                },
            })
            render(<AuthenticationPage />)
            fireEvent.click(screen.getByTestId("sign-up"))
            fireEvent.click(screen.getByTestId("submit-details"))
            await waitFor(() => expect(panel()).toContain('"state":"code"'))
            fireEvent.click(screen.getByTestId("submit-code"))
            await waitFor(() => expect(panel()).toContain('"state":"notice"'))
        }
        await arrivedAtHeldAddress()
        expect(panel()).toContain(copy("signUp.heldAddressTitle"))
        expect(panel()).toContain(copy("signUp.emailTaken"))
        expect(panel()).toContain(copy("signUp.heldAddressRecoverLabel"))
        expect(exits()).toBe("[]")
        expect(mocks.session.adopt).not.toHaveBeenCalled()
        expect(mocks.push).not.toHaveBeenCalled()

        fireEvent.click(screen.getByTestId("onward-secondary"))
        await waitFor(() => expect(panel()).toContain(copy("forgotPassword.title")))

        cleanup()
        await arrivedAtHeldAddress()
        fireEvent.click(screen.getByTestId("onward"))
        await waitFor(() => expect(panel()).toContain(copy("signIn.title")))
    })

    it("explains an identity created with no session and offers the password just set", async () => {
        mocks.api.signUpVerifyOtp.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: false,
                twoFactorToken: null,
                conclusion: { reason: "registeredSignInRequired" },
                undecided: null,
            },
        })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByTestId("sign-up"))
        fireEvent.click(screen.getByTestId("submit-details"))
        await waitFor(() => expect(panel()).toContain('"state":"code"'))
        fireEvent.click(screen.getByTestId("submit-code"))
        await waitFor(() => expect(panel()).toContain('"state":"notice"'))
        expect(panel()).toContain(copy("signUp.createdNoSessionNotice"))
        expect(panel()).toContain(copy("signUp.createdNoSessionSignInLabel"))
        expect(panel()).toContain('"secondaryLabel":""')
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    it("keeps both provider paths fresh after an unverified-email refusal", async () => {
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: false,
                twoFactorToken: null,
                providerEmailRefused: true,
                undecided: null,
            },
        })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain(copy("signIn.oauthEmailRefused")))
        expect(panel()).toContain('"state":"details"')
        expect(panel()).toContain('"mode":"signIn"')
        expect(exits()).toContain(copy("signIn.promptAction"))
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    it("continues a brokered undecided result under its reference and never resends the spent callback", async () => {
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: false,
                twoFactorToken: null,
                providerEmailRefused: null,
                undecided: { continuationReference: "hold-1" },
            },
        })
        mocks.api.continueBrokeredSignIn.mockResolvedValue({
            ok: true,
            data: {
                accessToken: "continued-access",
                requiresTwoFactor: false,
                twoFactorToken: null,
                providerEmailRefused: null,
                undecided: null,
            },
        })
        render(<AuthenticationPage />)
        await waitFor(() =>
            expect(mocks.api.continueBrokeredSignIn).toHaveBeenCalledWith({ continuationReference: "hold-1" }),
        )
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/overview"))
        expect(mocks.session.adopt).toHaveBeenCalledWith({
            accessToken: "continued-access",
            requiresTwoFactor: false,
            twoFactorToken: null,
            providerEmailRefused: null,
            undecided: null,
        })
        expect(mocks.api.exchangeOauthCode).toHaveBeenCalledTimes(1)
        expect(mocks.api.continueBrokeredSignIn).toHaveBeenCalledTimes(1)
        expect(panel()).not.toContain(copy("signIn.oauthUndecided"))
    })

    it("reports a brokered undecided result as a try-again when nothing could be held", async () => {
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: false,
                twoFactorToken: null,
                providerEmailRefused: null,
                undecided: { continuationReference: null },
            },
        })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain(copy("signIn.oauthUndecided")))
        expect(panel()).not.toContain(copy("signIn.oauthRefused"))
        expect(panel()).toContain('"isError":false')
        expect(mocks.api.exchangeOauthCode).toHaveBeenCalledTimes(1)
        expect(mocks.api.continueBrokeredSignIn).not.toHaveBeenCalled()
    })

    it("asks for nothing further when the continuation itself comes back undecided", async () => {
        window.sessionStorage.setItem("nivo.oauth.provider", "google")
        window.history.replaceState(null, "", "/authentication?code=abc&state=xyz")
        mocks.api.exchangeOauthCode.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: false,
                twoFactorToken: null,
                providerEmailRefused: null,
                undecided: { continuationReference: "hold-lapsed" },
            },
        })
        mocks.api.continueBrokeredSignIn.mockResolvedValue({
            ok: true,
            data: {
                accessToken: null,
                requiresTwoFactor: false,
                twoFactorToken: null,
                providerEmailRefused: null,
                undecided: { retryWithSameRequest: true },
            },
        })
        render(<AuthenticationPage />)
        await waitFor(() => expect(panel()).toContain(copy("signIn.oauthUndecided")))
        expect(panel()).not.toContain(copy("signIn.oauthRefused"))
        expect(mocks.api.continueBrokeredSignIn).toHaveBeenCalledTimes(1)
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    it("hands an unavailable requested place to the landing instead of parking it on the auth surface", async () => {
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
        expect(panel()).not.toContain(copy("unavailableReturnNotice"))
        expect(panel()).not.toContain("agentos")
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
        expect(panel()).toContain(copy("signOut.unconfirmedNotice"))
        expect(mocks.replace).toHaveBeenCalledWith("/authentication")
        expect(mocks.replace).toHaveBeenCalledTimes(1)

        // the param still sits on the test's static address; a re-render must not re-announce it
        rerender(<AuthenticationPage />)
        expect(mocks.replace).toHaveBeenCalledTimes(1)
        expect(panel()).toContain(copy("signOut.unconfirmedNotice"))
        expect(mocks.session.adopt).not.toHaveBeenCalled()
    })

    // The probe above stands in for the drawing half, so the accessibility check re-registers the
    // real `./component` for its own module registry and renders the anonymous sign-in screen.
})
