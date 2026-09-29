import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AuthDetailsCopy } from "@/modules/auth/authentication-panel/copy"
import { EMPTY, type AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
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
const localizedDetails = (messages: typeof enMessages): AuthDetailsCopy => ({
    ...details,
    emailLabel: messages.authentication.emailLabel,
    passwordLabel: messages.authentication.passwordLabel,
    confirmPasswordLabel: messages.authentication.confirmPasswordLabel,
    nameLabel: messages.authentication.nameLabel,
    revealLabel: messages.authentication.revealLabel,
    hideLabel: messages.authentication.hideLabel,
    googleLabel: messages.authentication.googleLabel,
    githubLabel: messages.authentication.githubLabel,
    forgotPasswordLabel: messages.authentication.forgotPasswordLabel,
    submitLabel: messages.authentication.signIn.submitLabel,
})

describe("AuthenticationPanelDetails", () => {
    it("names sign-in and registration fields through the English and Vietnamese catalogs", () => {
        for (const messages of [enMessages, viMessages]) {
            const localized = localizedDetails(messages)
            const signIn = render(
                <AuthenticationPanelDetails
                    state="details"
                    props={localized}
                    formState={formState()}
                    on={{ submitDetails: vi.fn() }}
                />,
            )
            expect(screen.getByRole("textbox", { name: messages.authentication.emailLabel })).toBeInTheDocument()
            expect(screen.getByRole("textbox", { name: messages.authentication.passwordLabel })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: messages.authentication.revealLabel })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: messages.authentication.signIn.submitLabel })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: messages.authentication.googleLabel })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: messages.authentication.githubLabel })).toBeInTheDocument()
            expect(screen.getByRole("checkbox", { name: messages.authentication.rememberMeLabel })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: messages.authentication.forgotPasswordLabel })).toBeInTheDocument()
            signIn.unmount()

            const signUp = render(
                <AuthenticationPanelDetails
                    state="details"
                    props={{
                        ...localized,
                        mode: "signUp",
                        submitLabel: messages.authentication.signUp.submitLabel,
                    }}
                    formState={formState()}
                    on={{ submitDetails: vi.fn() }}
                />,
            )
            expect(screen.getByRole("textbox", { name: messages.authentication.nameLabel })).toBeInTheDocument()
            expect(screen.getByRole("textbox", { name: messages.authentication.emailLabel })).toBeInTheDocument()
            expect(screen.getByRole("textbox", { name: messages.authentication.passwordLabel })).toBeInTheDocument()
            expect(
                screen.getByRole("textbox", { name: messages.authentication.confirmPasswordLabel }),
            ).toBeInTheDocument()
            expect(screen.getAllByRole("button", { name: messages.authentication.revealLabel })).toHaveLength(2)
            expect(screen.getByRole("button", { name: messages.authentication.signUp.submitLabel })).toBeInTheDocument()
            signUp.unmount()
        }
    })

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
