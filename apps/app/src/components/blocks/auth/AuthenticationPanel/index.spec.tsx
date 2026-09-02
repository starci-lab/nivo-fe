import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AuthenticationPanel, type AuthDetailsCopy, type AuthCodeCopy, type AuthNoticeCopy } from "./"

const frame = { title: "Sign in", subtitle: "Welcome", statusMessage: "", isError: false, isPending: false }
const details: AuthDetailsCopy = { ...frame, mode: "signIn", emailLabel: "Email", emailPlaceholder: "you@example.com", emailRequired: "Email required", emailInvalid: "Email invalid", emailHint: "Use your account email", passwordLabel: "Password", passwordPlaceholder: "Password", passwordRequired: "Password required", passwordTooShort: "Password too short", passwordHint: "At least 8 characters", confirmPasswordLabel: "Confirm", confirmPasswordPlaceholder: "Confirm password", confirmPasswordRequired: "Confirmation required", confirmPasswordMismatch: "Passwords differ", revealLabel: "Show", hideLabel: "Hide", submitLabel: "Continue", orLabel: "or", googleLabel: "Google", forgotPasswordLabel: "Forgot password", rememberMeLabel: "Remember me", isRememberMe: false, promptQuestion: "New here?", promptAction: "Sign up" }
const code: AuthCodeCopy = { ...frame, mode: "forgotPassword", codeLabel: "Code", codePlaceholder: "123456", codeRequired: "Code required", codeInvalid: "Code invalid", codeHint: "Check your inbox", newPasswordLabel: "New password", newPasswordPlaceholder: "New password", newPasswordRequired: "New password required", newPasswordTooShort: "New password too short", newPasswordHint: "Choose a new password", revealLabel: "Show", hideLabel: "Hide", submitLabel: "Reset", resendLabel: "Resend", cooldownLabel: "Wait", backLabel: "Back" }
const notice: AuthNoticeCopy = { ...frame, doneTitle: "Done", doneHint: "You may continue", onwardLabel: "Continue" }

describe("AuthenticationPanel", () => {
    it("draws sign-in details and reset-code journeys", () => {
        const first = renderToStaticMarkup(<AuthenticationPanel state="details" props={details} on={{ submitDetails: vi.fn() }} />)
        const second = renderToStaticMarkup(<AuthenticationPanel state="code" props={code} on={{ submitCode: vi.fn(), resend: vi.fn(), back: vi.fn() }} />)
        expect(first).toContain("Email")
        expect(first).toContain("Remember me")
        expect(second).toContain("123456")
        expect(second).toContain("Wait")
    })

    it("draws settled success and unsupported-factor notices", () => {
        const done = renderToStaticMarkup(<AuthenticationPanel state="done" props={notice} on={{ onward: vi.fn() }} />)
        const unsupported = renderToStaticMarkup(<AuthenticationPanel state="twoFactorUnsupported" props={{ ...notice, doneTitle: "Two-factor unavailable" }} on={{ onward: vi.fn() }} />)
        expect(done).toContain("Done")
        expect(unsupported).toContain("Two-factor unavailable")
    })

    it("projects pending state onto only the action that owns it", () => {
        const providerPending = renderToStaticMarkup(<AuthenticationPanel state="details" props={{ ...details, isPending: true, pendingAction: "provider" }} on={{ chooseProvider: vi.fn(), submitDetails: vi.fn() }} />)
        expect(providerPending).toContain('data-action-pending="true"')
        expect(providerPending.match(/data-action-pending="true"/g)).toHaveLength(1)
    })
})
