import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { RefusalGlyph } from "./"

describe("RefusalGlyph", () => {
    it("draws the refusal mark using current color", () => {
        const markup = renderToStaticMarkup(<RefusalGlyph />)
        expect(markup).toContain("<svg")
        expect(markup).toContain('stroke="currentColor"')
        expect(markup).toContain('fill="currentColor"')
    })

    it("has no accessibility violations when used decoratively", async () => {
        const { container } = render(<RefusalGlyph aria-hidden={true} focusable="false" />)
        await expectNoA11yViolations(container)
    })
})
