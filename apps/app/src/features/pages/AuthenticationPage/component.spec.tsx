import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { AuthDetailsCopy, AuthNoticeCopy } from "@/components/blocks/auth/AuthenticationPanel"

import { AuthenticationPageView } from "./component"

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
    nameLabel: "Display name",
    namePlaceholder: "What we call you",
    nameHint: "Optional",
    nameTooLong: "Name too long",
    authorityHint: "An account grants no purchase rights",
    revealLabel: "Show",
    hideLabel: "Hide",
    submitLabel: "Continue",
    orLabel: "or",
    googleLabel: "Google",
    githubLabel: "GitHub",
    forgotPasswordLabel: "Forgot password",
    rememberMeLabel: "Remember me",
    isRememberMe: false,
}

const notice: AuthNoticeCopy = {
    ...frame,
    doneTitle: "You're in",
    doneHint: "Taking you to your dashboard.",
    onwardLabel: "Continue",
    secondaryLabel: "",
}

const surfaceOf = (container: HTMLElement) => container.querySelector('[data-grammar-surface-card="true"]')

describe("AuthenticationPageView", () => {
    it("puts one surface under an external heading, and the exits outside it", () => {
        const { container } = render(<AuthenticationPageView
            panel={{ state: "details", props: details, on: { submitDetails: vi.fn() } }}
            exits={[{ question: "No account yet?", action: "Create one", onPress: vi.fn() }]}
        />)
        expect(screen.getByRole("heading", { level: 1, name: "Sign in" })).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "Nivo" })).toBeInTheDocument()
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
        expect(screen.getByRole("region", { name: "Sign in" })).toBeInTheDocument()

        /*
         * ONE SURFACE, AND THE FORM IS INSIDE IT. The direction's single joined surface is the only
         * card on the page; a second one would nest the task in a card-in-a-card.
         */
        const surface = surfaceOf(container)
        expect(surface).not.toBeNull()
        expect(container.querySelectorAll('[data-grammar-surface-card="true"]')).toHaveLength(1)
        expect(surface?.contains(screen.getByLabelText("Email"))).toBe(true)

        /*
         * THE EXITS ARE OUTSIDE THE SURFACE. That is the composition the direction draws: the way to
         * the other journey sits below the card rather than in its last band, so the surface ends at
         * the action it asks for.
         */
        expect(surface?.contains(screen.getByRole("button", { name: "Create one" }))).toBe(false)
    })

    it("keys the panel by step and journey so switching mode remounts uncontrolled fields", () => {
        const exits: [] = []
        const { rerender } = render(<AuthenticationPageView panel={{ state: "details", props: details, on: {} }} exits={exits} />)
        // Typed through the event path rather than assigned: an uncontrolled field only proves it
        // was remounted if the value it lost was one a reader could actually have put there.
        fireEvent.change(screen.getByLabelText("Email"), { target: { value: "reader@example.test" } })
        expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("reader@example.test")
        rerender(<AuthenticationPageView panel={{ state: "details", props: { ...details, mode: "signUp" }, on: {} }} exits={exits} />)
        expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("")
    })

    it("draws the settled notice tree and labels its region from the resolved title", () => {
        render(<AuthenticationPageView panel={{ state: "done", props: notice, on: { onward: vi.fn() } }} exits={[]} />)
        expect(screen.getByRole("heading", { level: 2, name: "You're in" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()
    })

    it("reserves the mascot for sign-in-ready alone, and keeps it decorative", () => {
        const { container, rerender } = render(<AuthenticationPageView panel={{ state: "details", props: details, on: {} }} exits={[]} />)
        const artwork = container.querySelector("aside")
        expect(artwork).not.toBeNull()
        expect(artwork).toHaveAttribute("aria-hidden", "true")
        expect(artwork?.querySelector("img")).toHaveAttribute("src", "/images/nivo-unicorn-overview.png")

        /*
         * NOT ON A REFUSAL, AND NOT ON A SETTLED NOTICE. The brand forbids the mascot on a failure
         * surface, and the record binds it to one state - so the assertion names the two that must
         * not have it rather than trusting that a shared tree happened to hide it.
         */
        rerender(<AuthenticationPageView panel={{ state: "details", props: { ...details, statusMessage: "That email or password is not right.", isError: true }, on: {} }} exits={[]} />)
        expect(container.querySelector("aside")).toBeNull()

        rerender(<AuthenticationPageView panel={{ state: "notice", props: notice, on: {} }} exits={[]} />)
        expect(container.querySelector("aside")).toBeNull()
    })
})