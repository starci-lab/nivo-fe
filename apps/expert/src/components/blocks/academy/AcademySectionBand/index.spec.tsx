import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademySectionBand } from "./index"

describe("AcademySectionBand", () => {
    it("keeps band parts in their supplied reading order", async () => {
        const { container } = render(
            AcademySectionBand.Band({ parts: [<span key="one">First</span>, <span key="two">Second</span>] }),
        )
        await expectNoA11yViolations(container)
        const html = container.innerHTML
        expect(html.indexOf("First")).toBeLessThan(html.indexOf("Second"))
    })
})
