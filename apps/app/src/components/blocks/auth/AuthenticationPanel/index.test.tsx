import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AuthenticationPanel, type AuthDetailsCopy, type AuthCodeCopy, type AuthNoticeCopy } from "./"

const frame = { title: "Sign in", subtitle: "Welcome", statusMessage: "", isError: false, isPending: false }
const details: AuthDetailsCopy = { ...frame, mode: "signIn", emailLabel: "Email", emailPlaceholder: "you@example.com", emailHint: "Use your account email", passwordLabel: "Password", passwordPlaceholder: "Password", passwordHint: "At least 8 characters", confirmPasswordLabel: "Confirm", confirmPasswordPlaceholder: "Confirm password", confirmPasswordMismatch: "Passwords differ", revealLabel: "Show", hideLabel: "Hide", submitLabel: "Continue", orLabel: "or", googleLabel: "Google", forgotPasswordLabel: "Forgot password", rememberMeLabel: "Remember me", isRememberMe: false, promptQuestion: "New here?", promptAction: "Sign up" }
const code: AuthCodeCopy = { ...frame, mode: "forgotPassword", codeLabel: "Code", codePlaceholder: "123456", codeHint: "Check your inbox", newPasswordLabel: "New password", newPasswordPlaceholder: "New password", newPasswordHint: "Choose a new password", revealLabel: "Show", hideLabel: "Hide", submitLabel: "Reset", resendLabel: "Resend", cooldownLabel: "Wait", backLabel: "Back" }
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
})
