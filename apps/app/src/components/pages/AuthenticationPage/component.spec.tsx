import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { AuthDetailsCopy, AuthNoticeCopy } from "@/components/blocks/auth/AuthenticationPanel"

type NextImageProbeProps = { readonly alt: string, readonly src: string }

vi.mock("next/image", () => ({
    default: (props: NextImageProbeProps) => <img alt={props.alt} src={props.src} />,
}))

import { AuthenticationPageBase } from "./component"

const frame = { title: "Sign in", subtitle: "Welcome back", statusMessage: "", isError: false, isPending: false }

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
    revealLabel: "Show",
    hideLabel: "Hide",
    submitLabel: "Continue",
    orLabel: "or",
    googleLabel: "Google",
    forgotPasswordLabel: "Forgot password",
    rememberMeLabel: "Remember me",
    isRememberMe: false,
    promptQuestion: "New here?",
    promptAction: "Sign up",
}

const notice: AuthNoticeCopy = {
    ...frame,
    doneTitle: "You're in",
    doneHint: "Taking you to your dashboard.",
    onwardLabel: "Continue",
}

describe("AuthenticationPageBase", () => {
    it("composes the decorative visual and the details panel without owning journey behaviour", () => {
        render(<AuthenticationPageBase panel={{ state: "details", props: details, on: { submitDetails: vi.fn() } }} />)
        expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
        expect(screen.getByRole("region", { name: "Sign in" })).toBeInTheDocument()
        // The product image is decorative: it carries no accessible name and sits in a
        // hidden landmark, so it never competes with the form for a screen reader's attention.
        expect(screen.queryByRole("img")).not.toBeInTheDocument()
    })

    it("keys the panel by step and journey so switching mode remounts uncontrolled fields", () => {
        const { rerender } = render(<AuthenticationPageBase panel={{ state: "details", props: details, on: {} }} />)
        const emailField = screen.getByLabelText("Email") as HTMLInputElement
        emailField.value = "reader@example.test"
        rerender(<AuthenticationPageBase panel={{ state: "details", props: { ...details, mode: "signUp" }, on: {} }} />)
        expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("")
    })

    it("draws the settled notice tree and labels its region from the resolved title", () => {
        render(<AuthenticationPageBase panel={{ state: "done", props: notice, on: { onward: vi.fn() } }} />)
        expect(screen.getByRole("heading", { name: "You're in" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()
    })
})
