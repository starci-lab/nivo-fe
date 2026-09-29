import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AuthDetailsCopy } from "@/modules/auth/authentication-panel/copy"
import { EMPTY, type AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
import { AuthenticationPanelDetails } from "./"

const frame = { title: "Sign in", subtitle: "Welcome", statusMessage: "", isError: false, isPending: false }
const details: AuthDetailsCopy = {
    ...frame,
    mode: "signIn",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    emailRequired: "Email required",
    emailInvalid: "Email invalid",
    emailHint: "Use your account email",
    passwordLabel: "Password",
    passwordPlaceholder: "Password",
    passwordRequired: "Password required",
    passwordTooShort: "Password too short",
    passwordHint: "At least 8 characters",
    confirmPasswordLabel: "Confirm",
    confirmPasswordPlaceholder: "Confirm password",
    confirmPasswordRequired: "Confirmation required",
    confirmPasswordMismatch: "Passwords differ",
    nameLabel: "Display name",
    namePlaceholder: "What we call you",
    nameHint: "Optional",
    nameTooLong: "Name too long",
    authorityHint: "An account grants no purchase rights",
    revealLabel: "Show",
    hideLabel: "Hide",
    submitLabel: "Continue",
    orLabel: "HOáº¶C",
    googleLabel: "Google",
    githubLabel: "GitHub",
    forgotPasswordLabel: "Forgot password",
    rememberMeLabel: "Remember me",
    isRememberMe: false,
}

const formState = (): AuthPanelFormState => ({
    values: { current: { ...EMPTY } },
    fieldErrors: {},
    setFieldErrors: vi.fn(),
    clearFieldError: vi.fn(),
    setFieldValue: vi.fn(),
})

const renderDetails = (copy: AuthDetailsCopy = details) =>
    renderToStaticMarkup(
        <AuthenticationPanelDetails state="details" props={copy} formState={formState()} on={{ submitDetails: vi.fn() }} />,
    )

describe("AuthenticationPanelDetails", () => {
    it("draws sign-in details and the remember-me option", () => {
        const markup = renderDetails()
        expect(markup).toContain("Email")
        expect(markup).toContain("Remember me")
    })

    it("draws both provider shortcuts and their divider on sign-in", () => {
        const markup = renderToStaticMarkup(
            <AuthenticationPanelDetails
                state="details"
                props={details}
                formState={formState()}
                on={{ chooseProvider: vi.fn(), submitDetails: vi.fn() }}
            />,
        )
        expect(markup).toContain("Google")
        expect(markup).toContain("GitHub")
        expect(markup).toContain("HOáº¶C")
    })

    it("keeps provider shortcuts off registration and recovery", () => {
        const register = renderDetails({ ...details, mode: "signUp" })
        const recovery = renderDetails({ ...details, mode: "forgotPassword" })
        for (const markup of [register, recovery]) {
            expect(markup).not.toContain("Google")
            expect(markup).not.toContain("GitHub")
            expect(markup).not.toContain("HOáº¶C")
        }
    })

    it("leads registration fields with display name and shows its authority sentence", () => {
        const markup = renderDetails({ ...details, mode: "signUp" })
        const order = ["Display name", "Email", "Password", "Confirm"].map((label) => markup.indexOf(label))
        expect(order.every((index) => index >= 0)).toBe(true)
        expect(order).toEqual([...order].sort((left, right) => left - right))
        expect(markup).toContain("An account grants no purchase rights")
    })

    it("projects pending state onto only the provider that owns it", () => {
        const markup = renderToStaticMarkup(
            <AuthenticationPanelDetails
                state="details"
                props={{ ...details, isPending: true, pendingAction: "provider", pendingProvider: "github" }}
                formState={formState()}
                on={{ chooseProvider: vi.fn(), submitDetails: vi.fn() }}
            />,
        )
        expect(markup).toContain('data-action-pending="true"')
        expect(markup.match(/data-action-pending="true"/g)).toHaveLength(1)
    })

    it("leaves both provider buttons disabled but unclaimed when the owner of the wait is gone", () => {
        const markup = renderToStaticMarkup(
            <AuthenticationPanelDetails
                state="details"
                props={{ ...details, isPending: true, pendingAction: "provider" }}
                formState={formState()}
                on={{ chooseProvider: vi.fn(), submitDetails: vi.fn() }}
            />,
        )
        expect(markup.match(/data-action-pending="true"/g)).toBeNull()
    })
})
