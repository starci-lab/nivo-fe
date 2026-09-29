import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AcademyRichSection } from "./index"

describe("AcademyRichSection", () => {
    it("draws the instructor identity and quote in authored order", () => {
        const html = renderToStaticMarkup(
            <AcademyRichSection
                section={{ kind: "instructor", id: "instructor", person: { name: "Teacher", photoUrl: "", title: "Coach", bio: "Bio", credentials: [], quote: "Learn" } }}
                imageState={{ failedImageSources: new Set(), failImage: () => undefined }}
            />,
        )
        expect(html.indexOf("Teacher")).toBeLessThan(html.indexOf("Coach"))
        expect(html).toContain("Learn")
    })
})
