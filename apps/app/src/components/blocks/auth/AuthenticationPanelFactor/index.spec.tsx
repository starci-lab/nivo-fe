import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AuthFactorCopy } from "@/modules/auth/authentication-panel/copy"
import { EMPTY, type AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
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
