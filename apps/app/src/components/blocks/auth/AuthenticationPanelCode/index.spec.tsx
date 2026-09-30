import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AuthActions } from "@/modules/auth/authentication-panel/actions"
import type { AuthCodeCopy } from "@/modules/auth/authentication-panel/copy"
import { EMPTY, type AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
import enMessages from "../../../../messages/en.json"
import viMessages from "../../../../messages/vi.json"
import { AuthenticationPanelCode } from "./"

const frame = { title: "Sign in", subtitle: "Welcome", statusMessage: "", isError: false, isPending: false }
const code: AuthCodeCopy = {
    ...frame,
    mode: "forgotPassword",
    codeLabel: "Code",
    codeRequired: "Code required",
    codeInvalid: "Code invalid",
    codeHint: "Check your inbox",
    newPasswordLabel: "New password",
    newPasswordPlaceholder: "New password",
    newPasswordRequired: "New password required",
    newPasswordTooShort: "New password too short",
    newPasswordHint: "Choose a new password",
    confirmNewPasswordLabel: "Repeat new password",
    confirmNewPasswordPlaceholder: "Repeat it",
    confirmNewPasswordRequired: "Repeat required",
    confirmNewPasswordMismatch: "Passwords differ",
    revealLabel: "Show",
    hideLabel: "Hide",
    submitLabel: "Reset",
    resendLabel: "Resend",
    cooldownLabel: "Wait",
    backLabel: "Back",
}

const formState = (): AuthPanelFormState => ({
    values: { current: { ...EMPTY } },
    fieldErrors: {},
    setFieldErrors: vi.fn(),
    clearFieldError: vi.fn(),
    setFieldValue: vi.fn(),
})

const renderCode = (copy: AuthCodeCopy = code, on: AuthActions = { submitCode: vi.fn(), resend: vi.fn() }) =>
    renderToStaticMarkup(<AuthenticationPanelCode state="code" props={copy} formState={formState()} on={on} />)
const localizedCode = (messages: typeof enMessages): AuthCodeCopy => ({
    ...code,
    cooldownLabel: "",
    resendLabel: messages.authentication.resendLabel,
    codeLabel: messages.authentication.codeLabel,
    newPasswordLabel: messages.authentication.newPasswordLabel,
    confirmNewPasswordLabel: messages.authentication.confirmNewPasswordLabel,
    revealLabel: messages.authentication.revealLabel,
    hideLabel: messages.authentication.hideLabel,
    submitLabel: messages.authentication.forgotPassword.codeSubmitLabel,
})

describe("AuthenticationPanelCode", () => {
    it("names the code and reset fields through the English and Vietnamese catalogs", async () => {
        for (const messages of [enMessages, viMessages]) {
            const localized = localizedCode(messages)
            const { container } = render(
                <AuthenticationPanelCode
                    state="code"
                    props={localized}
                    formState={formState()}
                    on={{ submitCode: vi.fn(), resend: vi.fn() }}
                />,
            )
            expect(screen.getByRole("group", { name: messages.authentication.codeLabel })).toBeInTheDocument()
            expect(screen.getByRole("textbox", { name: messages.authentication.codeLabel })).toBeInTheDocument()
            expect(screen.getByRole("textbox", { name: messages.authentication.newPasswordLabel })).toBeInTheDocument()
            expect(
                screen.getByRole("textbox", { name: messages.authentication.confirmNewPasswordLabel }),
            ).toBeInTheDocument()
            expect(screen.getAllByRole("button", { name: messages.authentication.revealLabel })).toHaveLength(2)
            expect(
                screen.getByRole("button", { name: messages.authentication.forgotPassword.codeSubmitLabel }),
            ).toBeInTheDocument()
            expect(screen.getByRole("button", { name: messages.authentication.resendLabel })).toBeInTheDocument()
            await expectNoA11yViolations(container)
        }
    })

    it("draws the reset code and password fields with their hint", () => {
        const markup = renderCode()
        expect(markup).toContain("Check your inbox")
        expect(markup).toContain("Repeat new password")
        expect(markup).toContain("Wait")
    })

    it("routes a server refusal through the code field error channel", () => {
        const markup = renderCode({ ...code, mode: "signUp", statusMessage: "That code is not right.", isError: true })
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
        const markup = renderCode()
        expect(markup).toContain("Check your inbox")
        expect(markup).not.toContain('data-tone="accent"')
        expect(markup).not.toContain('aria-invalid="true"')
    })

    it("draws cooldown before submit without drawing the host's journey exits", () => {
        const markup = renderCode(code, { submitCode: vi.fn(), resend: vi.fn(), back: vi.fn(), changeMode: vi.fn() })
        expect(markup).toContain("Wait")
        expect(markup).toContain('data-width="fill"')
        expect(markup).not.toContain("Back")
        expect(markup).not.toContain("Remembered it?")
    })

    it("names the code field once through OtpInput", () => {
        const markup = renderCode()
        expect(markup.match(/>Code</g)).toHaveLength(1)
    })
})
