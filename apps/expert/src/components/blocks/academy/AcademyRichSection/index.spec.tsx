import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademyRichSection } from "./index"

describe("AcademyRichSection", () => {
    it("draws the instructor identity and quote in authored order", async () => {
        const { container } = render(
            <AcademyRichSection
                section={{ kind: "instructor", id: "instructor", person: { name: "Teacher", photoUrl: "", title: "Coach", bio: "Bio", credentials: [], quote: "Learn" } }}
                imageState={{ failedImageSources: new Set(), failImage: () => undefined }}
            />,
        )
        await expectNoA11yViolations(container)
        const html = container.innerHTML
        expect(html.indexOf("Teacher")).toBeLessThan(html.indexOf("Coach"))
        expect(html).toContain("Learn")
    })
})
