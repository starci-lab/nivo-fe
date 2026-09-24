// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    adopt: vi.fn(),
    signIn: vi.fn(),
    signUpInit: vi.fn(),
    signUpResend: vi.fn(),
    signUpVerifyOtp: vi.fn(),
    forgotPasswordInit: vi.fn(),
    forgotPasswordResend: vi.fn(),
    forgotPasswordVerifyOtp: vi.fn(),
    verifyTwoFactor: vi.fn(),
    exchangeOauthCode: vi.fn(),
    continueBrokeredSignIn: vi.fn(),
    signOut: vi.fn(),
    oauthRedirectUrl: vi.fn(() => "https://auth.test"),
}))

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => ({ state: { status: "anonymous" }, adopt: mocks.adopt, end: vi.fn() }) }))
vi.mock("@/modules/api/auth", () => mocks)

import { AuthenticationPage } from "./AuthenticationPage"

const answered = { requiresTwoFactor: false, twoFactorToken: null }
const surfaceOf = () => document.querySelector('[data-grammar-surface-card="true"]')

const fillSignIn = () => {
    fireEvent.change(screen.getByLabelText("emailLabel"), { target: { value: "reader@example.test" } })
    fireEvent.change(screen.getByLabelText("passwordLabel"), { target: { value: "correct-horse" } })
}

/** A brokered completion the authority did not answer: the handle to a held proof, or none to hold. */
const brokeredUndecided = (continuationReference: string | null) => ({ ok: true, data: { accessToken: null, ...answered, providerEmailRefused: null, undecided: { continuationReference } } })
/** What repeating the held proof answers with once the identity read finally runs. */
const brokeredContinued = (accessToken: string) => ({ ok: true, data: { accessToken, ...answered, providerEmailRefused: null, undecided: null } })
/** The callback leg: a spent `state` handle and the code the broker returned. */
const arriveFromProvider = () => window.history.replaceState(null, "", "/authentication?code=authorization-code&state=opaque-handle")

describe("AuthenticationPage interactions", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.signIn.mockResolvedValue({ ok: false, reason: "Invalid credentials", code: "INVALID_CREDENTIALS" })
        mocks.signUpInit.mockResolvedValue({ ok: true, data: { challengeId: "challenge", expiresInSeconds: 300 } })
        mocks.signUpVerifyOtp.mockResolvedValue({ ok: true, data: { accessToken: "access", conclusion: null, undecided: null, ...answered } })
        mocks.forgotPasswordInit.mockResolvedValue({ ok: true, data: { challengeId: "reset", expiresInSeconds: 300 } })
        mocks.forgotPasswordVerifyOtp.mockResolvedValue({ ok: true, data: true })
        mocks.verifyTwoFactor.mockResolvedValue({ ok: true, data: { accessToken: "two-factor", ...answered } })
        mocks.exchangeOauthCode.mockResolvedValue({ ok: false, reason: "oauth-failed", code: "OAUTH_REFUSED" })
        window.history.replaceState(null, "", "/authentication")
        window.sessionStorage.clear()
    })

    it("keeps invalid input at its fields without sending a request", async () => {
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByRole("button", { name: "signIn.submitLabel" }))

        expect(await screen.findByText("emailRequired")).toBeInTheDocument()
        expect(screen.getByText("passwordRequired")).toBeInTheDocument()
        expect(document.querySelector("input[name='email']")).toHaveAttribute("aria-invalid", "true")
        expect(document.querySelector("input[name='password']")).toHaveAttribute("aria-invalid", "true")
        expect(mocks.signIn).not.toHaveBeenCalled()
    })

    it("submits valid credentials and masks the transport refusal", async () => {
        render(<AuthenticationPage />)
        fillSignIn()
        fireEvent.click(screen.getByRole("button", { name: "signIn.submitLabel" }))
        expect(await screen.findByText("signIn.refused")).toBeInTheDocument()
        expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument()
        expect(mocks.push).not.toHaveBeenCalled()
    })

    it("says nivo could not complete the sign-in, rather than refusing a credential nobody judged", async () => {
        mocks.signIn.mockResolvedValue({ ok: false, reason: "network", code: "NETWORK" })
        render(<AuthenticationPage />)
        fillSignIn()
        fireEvent.click(screen.getByRole("button", { name: "signIn.submitLabel" }))

        expect(await screen.findByText("signIn.undecided")).toBeInTheDocument()
        expect(screen.queryByText("signIn.refused")).not.toBeInTheDocument()
    })

    it("keeps the submit pending until the answer settles and refuses a second press", async () => {
        let settle: (answer: unknown) => void = () => undefined
        mocks.signIn.mockImplementation(() => new Promise(resolve => {
            settle = resolve
        }))
        render(<AuthenticationPage />)
        fillSignIn()
        const submit = screen.getByRole("button", { name: "signIn.submitLabel" })
        fireEvent.click(submit)

        await waitFor(() => expect(document.querySelectorAll('[data-action-pending="true"]')).toHaveLength(1))
        fireEvent.click(submit)
        expect(mocks.signIn).toHaveBeenCalledTimes(1)

        settle({ ok: false, reason: "Invalid credentials", code: "INVALID_CREDENTIALS" })
        expect(await screen.findByText("signIn.refused")).toBeInTheDocument()
        await waitFor(() => expect(document.querySelectorAll('[data-action-pending="true"]')).toHaveLength(0))
    })

    it("tells only the proven mailbox holder that the address is held, and offers both ways out", async () => {
        mocks.signUpVerifyOtp.mockResolvedValue({ ok: true, data: { accessToken: null, conclusion: { reason: "heldAddress" }, undecided: null, ...answered } })
        render(<AuthenticationPage />)
        fireEvent.click(screen.getByRole("button", { name: "signIn.promptAction" }))
        fireEvent.change(screen.getByLabelText("emailLabel"), { target: { value: "reader@example.test" } })
        fireEvent.change(screen.getByLabelText("passwordLabel"), { target: { value: "correct-horse" } })
        fireEvent.change(screen.getByLabelText("confirmPasswordLabel"), { target: { value: "correct-horse" } })
        fireEvent.click(screen.getByRole("button", { name: "signUp.submitLabel" }))
        expect(await screen.findByText("signUp.codeSubtitle")).toBeInTheDocument()

        fireEvent.change(document.querySelector("input[name='otp']") as HTMLInputElement, { target: { value: "194273" } })
        fireEvent.click(screen.getByRole("button", { name: "signUp.codeSubmitLabel" }))

        expect(await screen.findByText("signUp.heldAddressTitle")).toBeInTheDocument()
        expect(screen.getByText("signUp.emailTaken")).toBeInTheDocument()
        expect(mocks.adopt).not.toHaveBeenCalled()
        expect(mocks.push).not.toHaveBeenCalled()

        /*
         * BOTH WAYS OUT ARE PART OF THE NOTICE ITSELF, and the primary closes the surface's bottom
         * band. The record derives this ending with one Button and one TextAction and no code entry
         * at all, so the assertion names the surface as their owner rather than the page's exits.
         */
        const signInExit = screen.getByRole("button", { name: "signUp.heldAddressSignInLabel" })
        const recoverExit = screen.getByRole("button", { name: "signUp.heldAddressRecoverLabel" })
        expect(surfaceOf()?.contains(signInExit)).toBe(true)
        expect(surfaceOf()?.contains(recoverExit)).toBe(true)
        expect(screen.queryByLabelText("codeLabel")).not.toBeInTheDocument()

        fireEvent.click(recoverExit)
        expect(await screen.findByText("forgotPassword.title")).toBeInTheDocument()
    })

    it("draws the mascot on sign-in-ready only, never on a refusal", async () => {
        const { container } = render(<AuthenticationPage />)
        expect(container.querySelector("aside")).not.toBeNull()

        mocks.signIn.mockResolvedValue({ ok: false, reason: "Invalid credentials", code: "INVALID_CREDENTIALS" })
        fillSignIn()
        fireEvent.click(screen.getByRole("button", { name: "signIn.submitLabel" }))
        expect(await screen.findByText("signIn.refused")).toBeInTheDocument()
        expect(container.querySelector("aside")).toBeNull()
    })

    it("continues a brokered undecided result under the reference it returned, never resending the callback", async () => {
        mocks.exchangeOauthCode.mockResolvedValue(brokeredUndecided("hold-1"))
        mocks.continueBrokeredSignIn.mockResolvedValue(brokeredContinued("continued"))
        arriveFromProvider()
        render(<AuthenticationPage />)

        await waitFor(() => expect(mocks.continueBrokeredSignIn).toHaveBeenCalledTimes(1))
        expect(mocks.continueBrokeredSignIn).toHaveBeenCalledWith({ continuationReference: "hold-1" })
        expect(mocks.exchangeOauthCode).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(mocks.adopt).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "continued" })))
        expect(mocks.push).toHaveBeenCalledWith("/overview")
    })

    it("places a continued brokered sign-in on the validated return-to, not on the default landing", async () => {
        window.sessionStorage.setItem("nivo.auth.return-to", "/console/orders")
        mocks.exchangeOauthCode.mockResolvedValue(brokeredUndecided("hold-2"))
        mocks.continueBrokeredSignIn.mockResolvedValue(brokeredContinued("continued"))
        arriveFromProvider()
        render(<AuthenticationPage />)

        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/console/orders"))
        expect(mocks.adopt).toHaveBeenCalledWith(expect.objectContaining({ accessToken: "continued" }))
        expect(mocks.continueBrokeredSignIn).toHaveBeenCalledWith({ continuationReference: "hold-2" })
    })

    it("leaves fresh provider starts as the way on when the undecided result carried no reference", async () => {
        mocks.exchangeOauthCode.mockResolvedValue(brokeredUndecided(null))
        arriveFromProvider()
        render(<AuthenticationPage />)

        expect(await screen.findByText("signIn.oauthUndecided")).toBeInTheDocument()
        expect(screen.queryByText("signIn.oauthRefused")).not.toBeInTheDocument()
        expect(mocks.continueBrokeredSignIn).not.toHaveBeenCalled()
        expect(mocks.exchangeOauthCode).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(screen.getByRole("button", { name: "googleLabel" })).toBeEnabled())
        expect(screen.getByRole("button", { name: "githubLabel" })).toBeEnabled()
    })
})