import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AcademySectionBand } from "./index"

describe("AcademySectionBand", () => {
    it("keeps band parts in their supplied reading order", () => {
        const html = renderToStaticMarkup(
            AcademySectionBand.Band({ parts: [<span key="one">First</span>, <span key="two">Second</span>] }),
        )
        expect(html.indexOf("First")).toBeLessThan(html.indexOf("Second"))
    })
})
