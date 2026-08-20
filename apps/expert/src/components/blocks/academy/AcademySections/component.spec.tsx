import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademySectionsBase } from "./component"
import type { AcademySection } from "./index"

describe("academy section renderer", () => {
    it("renders courses, empty catalog and custom shape branches", () => {
        const sections: AcademySection[] = [
            { kind: "courses", id: "courses", title: "Courses", emptyTitle: "No courses", emptyBody: "Come back soon", courses: [] },
            { kind: "custom", id: "quote", content: { variant: "quote", heading: "A promise", body: "Learn with confidence", attribution: "Teacher" } },
            { kind: "custom", id: "columns", content: { variant: "columns", heading: "Benefits", columns: [{ title: "Fast", text: "Start today" }] } },
        ]
        const html = renderToStaticMarkup(<AcademySectionsBase sections={sections} onSubmitLead={vi.fn()} />)
        expect(html).toContain("No courses")
        expect(html).toContain("Learn with confidence")
        expect(html).toContain("Start today")
    })

    it("renders the lead form fields and authored copy", () => {
        const section: AcademySection = { kind: "lead", id: "lead", title: "Contact", body: "Tell us about you", nameLabel: "Name", phoneLabel: "Phone", submitLabel: "Send", sendingLabel: "Sending", sentMessage: "Sent", errorMessage: "Failed" }
        const html = renderToStaticMarkup(<AcademySectionsBase sections={[section]} onSubmitLead={vi.fn()} />)
        expect(html).toContain("Tell us about you")
        expect(html).toContain("lead-name")
        expect(html).toContain("lead-phone")
    })
})
