import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AcademySimpleSection } from "./index"

describe("AcademySimpleSection", () => {
    it("preserves the hero actions and order", () => {
        const html = renderToStaticMarkup(
            <AcademySimpleSection section={{ kind: "hero", id: "hero", name: "Academy", tagline: "Learn", tryFreeLabel: "Try", seeCoursesLabel: "Courses" }} />,
        )
        expect(html.indexOf("Academy")).toBeLessThan(html.indexOf("Learn"))
        expect(html).toContain("#courses")
    })
})
