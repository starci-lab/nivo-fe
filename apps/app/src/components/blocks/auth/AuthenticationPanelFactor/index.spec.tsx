import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AuthFactorCopy } from "@/modules/auth/authentication-panel/copy"
import { EMPTY, type AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
import enMessages from "../../../../messages/en.json"
import viMessages from "../../../../messages/vi.json"
import { AuthenticationPanelFactor } from "./"

const factor: AuthFactorCopy = {
    title: "Sign in",
    subtitle: "Welcome",
    statusMessage: "",
    isError: false,
    isPending: false,
    codeLabel: "Authenticator code",
    codeRequired: "Code required",
    codeInvalid: "Six digits",
    submitLabel: "Verify",
    backLabel: "Back",
}

const formState: AuthPanelFormState = {
    values: { current: { ...EMPTY } },
    fieldErrors: {},
    setFieldErrors: vi.fn(),
    clearFieldError: vi.fn(),
    setFieldValue: vi.fn(),
}

describe("AuthenticationPanelFactor", () => {
    it("names the second-factor code field through both locale catalogs", async () => {
        for (const messages of [enMessages, viMessages]) {
            const { container } = render(
                <AuthenticationPanelFactor
                    state="secondFactor"
                    props={{
                        ...factor,
                        codeLabel: messages.authentication.codeLabel,
                        submitLabel: messages.authentication.signIn.twoFactorSubmitLabel,
                    }}
                    formState={formState}
                    on={{ submitFactor: vi.fn(), back: vi.fn() }}
                />,
            )
            expect(screen.getByRole("group", { name: messages.authentication.codeLabel })).toBeInTheDocument()
            expect(screen.getByRole("textbox", { name: messages.authentication.codeLabel })).toBeInTheDocument()
            expect(
                screen.getByRole("button", { name: messages.authentication.signIn.twoFactorSubmitLabel }),
            ).toBeInTheDocument()
            await expectNoA11yViolations(container)
        }
    })

    it("draws the second-factor challenge without a resend affordance", () => {
        const markup = renderToStaticMarkup(
            <AuthenticationPanelFactor
                state="secondFactor"
                props={factor}
                formState={formState}
                on={{ submitFactor: vi.fn(), back: vi.fn() }}
            />,
        )
        expect(markup).toContain("Authenticator code")
        expect(markup).toContain("Verify")
        expect(markup).not.toContain("Resend")
    })
})
