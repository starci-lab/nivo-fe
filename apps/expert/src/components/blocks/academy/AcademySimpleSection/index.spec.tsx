import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademySimpleSection } from "./index"

describe("AcademySimpleSection", () => {
    it("preserves the hero actions and order", async () => {
        const { container } = render(
            <AcademySimpleSection section={{ kind: "hero", id: "hero", name: "Academy", tagline: "Learn", tryFreeLabel: "Try", seeCoursesLabel: "Courses" }} />,
        )
        await expectNoA11yViolations(container)
        const html = container.innerHTML
        expect(html.indexOf("Academy")).toBeLessThan(html.indexOf("Learn"))
        expect(html).toContain("#courses")
    })
})
