import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademySectionFigure } from "./index"

describe("AcademySectionFigure", () => {
    it("keeps the placeholder frame when no image is authored", async () => {
        const { container } = render(
            <AcademySectionFigure alt="Teacher" failedImageSources={new Set()} failImage={() => undefined} />,
        )
        await expectNoA11yViolations(container)
        const html = container.innerHTML
        expect(html).toContain("<figure")
        expect(html).toContain("<svg")
    })
})
