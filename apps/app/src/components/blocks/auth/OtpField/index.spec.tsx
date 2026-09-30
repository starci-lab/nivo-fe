import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { OtpField } from "./"

describe("OtpField", () => {
    it("makes the code input reachable by role and its catalog label", async () => {
        const { container } = render(
            <OtpField
                id="authentication-code"
                label="Verification code"
                statusId="authentication-code-status"
                message="Enter the code."
                isError={false}
                isPending={false}
                onValue={vi.fn()}
            />,
        )
        expect(screen.getByRole("group", { name: "Verification code" })).toBeInTheDocument()
        expect(screen.getByRole("textbox", { name: "Verification code" })).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })

    it("connects the visible label and refusal status to the six-slot input", () => {
        const markup = renderToStaticMarkup(
            <OtpField
                id="authentication-code"
                label="Code"
                statusId="authentication-code-status"
                message="That code is not right."
                isError
                isPending={false}
                onValue={vi.fn()}
            />,
        )
        expect(markup).toContain('id="authentication-code-status"')
        expect(markup).toContain('role="alert"')
        expect(markup).toContain('aria-live="assertive"')
        expect(markup).toContain('aria-invalid="true"')
        expect(markup).toContain('data-start-content="true"')
    })

    it("keeps a neutral hint muted and not invalid", () => {
        const markup = renderToStaticMarkup(
            <OtpField
                id="authentication-code"
                label="Code"
                statusId="authentication-code-status"
                message="Check your inbox"
                isError={false}
                isPending={false}
                onValue={vi.fn()}
            />,
        )
        expect(markup).toContain("Check your inbox")
        expect(markup).not.toContain('data-tone="accent"')
        expect(markup).not.toContain('aria-invalid="true"')
    })
})
