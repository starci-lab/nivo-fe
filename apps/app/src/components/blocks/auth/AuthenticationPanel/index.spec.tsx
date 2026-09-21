import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AuthenticationPanel, type AuthDetailsCopy, type AuthCodeCopy, type AuthFactorCopy, type AuthNoticeCopy, type AuthRestoringCopy } from "./"

const frame = { title: "Sign in", subtitle: "Welcome", statusMessage: "", isError: false, isPending: false }
const details: AuthDetailsCopy = { ...frame, mode: "signIn", emailLabel: "Email", emailPlaceholder: "you@example.com", emailRequired: "Email required", emailInvalid: "Email invalid", emailHint: "Use your account email", passwordLabel: "Password", passwordPlaceholder: "Password", passwordRequired: "Password required", passwordTooShort: "Password too short", passwordHint: "At least 8 characters", confirmPasswordLabel: "Confirm", confirmPasswordPlaceholder: "Confirm password", confirmPasswordRequired: "Confirmation required", confirmPasswordMismatch: "Passwords differ", nameLabel: "Display name", namePlaceholder: "What we call you", nameHint: "Optional", nameTooLong: "Name too long", authorityHint: "An account grants no purchase rights", revealLabel: "Show", hideLabel: "Hide", submitLabel: "Continue", orLabel: "or", googleLabel: "Google", githubLabel: "GitHub", forgotPasswordLabel: "Forgot password", rememberMeLabel: "Remember me", isRememberMe: false, promptQuestion: "New here?", promptAction: "Sign up" }
const code: AuthCodeCopy = { ...frame, mode: "forgotPassword", codeLabel: "Code", codeRequired: "Code required", codeInvalid: "Code invalid", codeHint: "Check your inbox", newPasswordLabel: "New password", newPasswordPlaceholder: "New password", newPasswordRequired: "New password required", newPasswordTooShort: "New password too short", newPasswordHint: "Choose a new password", confirmNewPasswordLabel: "Repeat new password", confirmNewPasswordPlaceholder: "Repeat it", confirmNewPasswordRequired: "Repeat required", confirmNewPasswordMismatch: "Passwords differ", revealLabel: "Show", hideLabel: "Hide", submitLabel: "Reset", resendLabel: "Resend", cooldownLabel: "Wait", backLabel: "Back", promptQuestion: "Remembered it?", promptAction: "Sign in" }
const factor: AuthFactorCopy = { ...frame, codeLabel: "Authenticator code", codeRequired: "Code required", codeInvalid: "Six digits", submitLabel: "Verify", backLabel: "Back" }
const restoring: AuthRestoringCopy = { title: "Checking your session", subtitle: "One moment", progressLabel: "Restoring your session" }
const notice: AuthNoticeCopy = { ...frame, doneTitle: "Done", doneHint: "You may continue", onwardLabel: "Continue" }

describe("AuthenticationPanel", () => {
    it("draws sign-in details and reset-code journeys", () => {
        const first = renderToStaticMarkup(<AuthenticationPanel state="details" props={details} on={{ submitDetails: vi.fn() }} />)
        const second = renderToStaticMarkup(<AuthenticationPanel state="code" props={code} on={{ submitCode: vi.fn(), resend: vi.fn(), back: vi.fn() }} />)
        expect(first).toContain("Email")
        expect(first).toContain("Remember me")
        expect(second).toContain("Check your inbox")
        expect(second).toContain("Repeat new password")
        expect(second).toContain("Wait")
    })

    it("draws both provider shortcuts on the first step", () => {
        const markup = renderToStaticMarkup(<AuthenticationPanel state="details" props={details} on={{ chooseProvider: vi.fn(), submitDetails: vi.fn() }} />)
        expect(markup).toContain("Google")
        expect(markup).toContain("GitHub")
    })

    it("draws the display name and the authority sentence on the registration journey", () => {
        const markup = renderToStaticMarkup(<AuthenticationPanel state="details" props={{ ...details, mode: "signUp" }} on={{ submitDetails: vi.fn() }} />)
        expect(markup).toContain("Display name")
        expect(markup).toContain("An account grants no purchase rights")
    })

    it("draws the second-factor challenge with no resend affordance", () => {
        const markup = renderToStaticMarkup(<AuthenticationPanel state="secondFactor" props={factor} on={{ submitFactor: vi.fn(), back: vi.fn() }} />)
        expect(markup).toContain("Authenticator code")
        expect(markup).toContain("Verify")
        expect(markup).not.toContain("Resend")
    })

    it("draws the restoring wait instead of any form", () => {
        const markup = renderToStaticMarkup(<AuthenticationPanel state="restoring" props={restoring} />)
        expect(markup).toContain("Checking your session")
        expect(markup).toContain("Restoring your session")
        expect(markup).not.toContain("submit")
    })

    it("draws settled success and unsupported-factor notices", () => {
        const done = renderToStaticMarkup(<AuthenticationPanel state="done" props={notice} on={{ onward: vi.fn() }} />)
        const unsupported = renderToStaticMarkup(<AuthenticationPanel state="twoFactorUnsupported" props={{ ...notice, doneTitle: "Two-factor unavailable" }} on={{ onward: vi.fn() }} />)
        expect(done).toContain("Done")
        expect(unsupported).toContain("Two-factor unavailable")
    })

    it("projects pending state onto only the provider that owns it", () => {
        const providerPending = renderToStaticMarkup(<AuthenticationPanel state="details" props={{ ...details, isPending: true, pendingAction: "provider", pendingProvider: "github" }} on={{ chooseProvider: vi.fn(), submitDetails: vi.fn() }} />)
        expect(providerPending).toContain('data-action-pending="true"')
        expect(providerPending.match(/data-action-pending="true"/g)).toHaveLength(1)
    })

    it("leaves both provider buttons disabled but unclaimed when the owner of the wait is gone", () => {
        const providerPending = renderToStaticMarkup(<AuthenticationPanel state="details" props={{ ...details, isPending: true, pendingAction: "provider" }} on={{ chooseProvider: vi.fn(), submitDetails: vi.fn() }} />)
        expect(providerPending.match(/data-action-pending="true"/g)).toBeNull()
    })

    it("routes a server refusal through the code field's error channel", () => {
        const markup = renderToStaticMarkup(<AuthenticationPanel state="code" props={{ ...code, mode: "signUp", statusMessage: "That code is not right.", isError: true }} on={{ submitCode: vi.fn(), resend: vi.fn(), back: vi.fn() }} />)
        expect(markup.match(/That code is not right\./g)).toHaveLength(1)
        expect(markup).toContain('id="authentication-code-status"')
        expect(markup).toContain('data-tone="accent"')
        expect(markup).toContain('data-start-content="true"')
        expect(markup).toContain('role="alert"')
        expect(markup).toContain('aria-live="assertive"')
        expect(markup).toContain('aria-invalid="true"')
        expect(markup).not.toContain('data-tone="accent" id')
    })

    it("keeps the neutral code hint muted when nothing was refused", () => {
        const markup = renderToStaticMarkup(<AuthenticationPanel state="code" props={code} on={{ submitCode: vi.fn(), resend: vi.fn(), back: vi.fn() }} />)
        expect(markup).toContain("Check your inbox")
        expect(markup).not.toContain('data-tone="accent"')
        expect(markup).not.toContain('aria-invalid="true"')
    })

    it("draws the journey prompt and a full-width submit on the code step", () => {
        const markup = renderToStaticMarkup(<AuthenticationPanel state="code" props={code} on={{ submitCode: vi.fn(), resend: vi.fn(), back: vi.fn(), changeMode: vi.fn() }} />)
        expect(markup).toContain("Remembered it?")
        expect(markup).toContain("Sign in")
        expect(markup).toContain('data-width="fill"')
    })
})
