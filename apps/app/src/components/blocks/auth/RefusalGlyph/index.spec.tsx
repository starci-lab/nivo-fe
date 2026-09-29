import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { RefusalGlyph } from "./"

describe("RefusalGlyph", () => {
    it("draws the refusal mark using current color", () => {
        const markup = renderToStaticMarkup(<RefusalGlyph />)
        expect(markup).toContain("<svg")
        expect(markup).toContain('stroke="currentColor"')
        expect(markup).toContain('fill="currentColor"')
    })
})
