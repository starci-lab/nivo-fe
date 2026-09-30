import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AcademyCustomSection } from "./index"

describe("AcademyCustomSection", () => {
    it("uses body copy for quotes and retains the author's attribution", async () => {
        const { container } = render(
            <AcademyCustomSection
                section={{ kind: "custom", id: "quote", content: { variant: "quote", heading: "Heading", body: "Body", attribution: "Teacher" } }}
                imageState={{ failedImageSources: new Set(), failImage: () => undefined }}
            />,
        )
        await expectNoA11yViolations(container)
        const html = container.innerHTML
        expect(html).toContain("Body")
        expect(html).toContain("Teacher")
    })
})
