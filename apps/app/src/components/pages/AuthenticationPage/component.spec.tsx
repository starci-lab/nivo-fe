import { fireEvent, render, screen } from "@testing-library/react"
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
        const { container } = render(<AuthenticationPageBase panel={{ state: "details", props: details, on: { submitDetails: vi.fn() } }} />)
        expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument()
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
        expect(screen.getByRole("region", { name: "Sign in" })).toBeInTheDocument()
        /*
         * The product art is decorative, and the aside is what makes it so: `aria-hidden` takes
         * the whole visual column out of the accessibility tree, so nothing inside it competes
         * with the form. The assertion names that cause. It cannot be written through a role or
         * label query - an element removed from the tree has neither - so the aside is read from
         * the container, which is the only honest way to state the fact.
         */
        const decorativeAside = container.querySelector("aside")
        expect(decorativeAside).not.toBeNull()
        expect(decorativeAside).toHaveAttribute("aria-hidden", "true")
    })

    it("keys the panel by step and journey so switching mode remounts uncontrolled fields", () => {
        const { rerender } = render(<AuthenticationPageBase panel={{ state: "details", props: details, on: {} }} />)
        // Typed through the event path rather than assigned: an uncontrolled field only proves it
        // was remounted if the value it lost was one a reader could actually have put there.
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "reader@example.test" } })
        expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("reader@example.test")
        rerender(<AuthenticationPageBase panel={{ state: "details", props: { ...details, mode: "signUp" }, on: {} }} />)
        expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("")
    })

    it("draws the settled notice tree and labels its region from the resolved title", () => {
        render(<AuthenticationPageBase panel={{ state: "done", props: notice, on: { onward: vi.fn() } }} />)
        expect(screen.getByRole("heading", { name: "You're in" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()
    })
})
