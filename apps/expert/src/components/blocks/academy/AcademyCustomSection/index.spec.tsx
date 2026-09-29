import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AcademyCustomSection } from "./index"

describe("AcademyCustomSection", () => {
    it("uses body copy for quotes and retains the author's attribution", () => {
        const html = renderToStaticMarkup(
            <AcademyCustomSection
                section={{ kind: "custom", id: "quote", content: { variant: "quote", heading: "Heading", body: "Body", attribution: "Teacher" } }}
                imageState={{ failedImageSources: new Set(), failImage: () => undefined }}
            />,
        )
        expect(html).toContain("Body")
        expect(html).toContain("Teacher")
    })
})
