import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { OtpField } from "./"

describe("OtpField", () => {
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
