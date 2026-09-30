import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import en from "@/messages/en.json"
import { expectNoA11yViolations } from "@/testing/axe"
import { AuthenticationPanel } from "./"

const copy = en.authentication

describe("AuthenticationPanel", () => {
    it("dispatches restoring state to its wait block", () => {
        const markup = renderToStaticMarkup(
            <AuthenticationPanel
                state="restoring"
                props={{ title: "Checking session", subtitle: "One moment", progressLabel: "Restoring session" }}
                on={{ back: vi.fn() }}
            />,
        )
        expect(markup).toContain("Restoring session")
        expect(markup).not.toContain("One moment")
    })

    it("dispatches all settled states to the notice block", () => {
        const props = {
            title: "Done",
            subtitle: "Continue",
            statusMessage: "",
            isError: false,
            isPending: false,
            doneTitle: "Complete",
            doneHint: "You may continue",
            onwardLabel: "Continue",
            secondaryLabel: "",
        }
        const states = ["done", "twoFactorUnsupported", "notice"] as const
        for (const state of states) {
            const markup = renderToStaticMarkup(<AuthenticationPanel state={state} props={props} />)
            expect(markup).toContain("Complete")
        }
    })

    it("has no axe violations", async () => {
        const { container } = render(
            <AuthenticationPanel
                state="details"
                props={{
                    title: copy.signIn.title,
                    subtitle: copy.signIn.subtitle,
                    statusMessage: "",
                    isError: false,
                    isPending: false,
                    mode: "signIn",
                    emailLabel: copy.emailLabel,
                    emailPlaceholder: copy.emailPlaceholder,
                    emailRequired: copy.emailRequired,
                    emailInvalid: copy.emailInvalid,
                    emailHint: copy.emailHint,
                    passwordLabel: copy.passwordLabel,
                    passwordPlaceholder: copy.passwordPlaceholder,
                    passwordRequired: copy.passwordRequired,
                    passwordTooShort: copy.passwordTooShort,
                    passwordHint: copy.passwordHint,
                    confirmPasswordLabel: copy.confirmPasswordLabel,
                    confirmPasswordPlaceholder: copy.confirmPasswordPlaceholder,
                    confirmPasswordRequired: copy.confirmPasswordRequired,
                    confirmPasswordMismatch: copy.confirmPasswordMismatch,
                    nameLabel: copy.nameLabel,
                    namePlaceholder: copy.namePlaceholder,
                    nameHint: copy.nameOptionalHint,
                    nameTooLong: copy.nameTooLong,
                    authorityHint: copy.signUp.authorityHint,
                    revealLabel: copy.revealLabel,
                    hideLabel: copy.hideLabel,
                    submitLabel: copy.signIn.submitLabel,
                    orLabel: copy.orLabel,
                    googleLabel: copy.googleLabel,
                    githubLabel: copy.githubLabel,
                    forgotPasswordLabel: copy.forgotPasswordLabel,
                    rememberMeLabel: copy.rememberMeLabel,
                    isRememberMe: true,
                }}
                on={{ submitDetails: vi.fn() }}
            />,
        )
        await expectNoA11yViolations(container)
    })
})
