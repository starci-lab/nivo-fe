import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademySectionsBase, type AcademySectionsViewProps } from "./component"
import type { AcademySection } from "./index"

const sections: ReadonlyArray<AcademySection> = [
    { kind: "hero", id: "hero", name: "Academy", tagline: "Learn", tryFreeLabel: "Try", seeCoursesLabel: "Courses" },
    { kind: "problems", id: "problems", title: "Problems", problems: ["Busy"] },
    { kind: "outcomes", id: "outcomes", title: "Outcomes", outcomes: ["Ship"] },
    { kind: "roadmap", id: "roadmap", title: "Roadmap", steps: ["Start"] },
    { kind: "instructor", id: "instructor", person: { name: "Teacher", photoUrl: "https://img.test/teacher.jpg", title: "Coach", bio: "Bio", credentials: ["Expert"], quote: "Learn" } },
    { kind: "stats", id: "stats", stats: [{ value: "10", label: "Students" }] },
    { kind: "testimonials", id: "testimonials", title: "Testimonials", testimonials: [{ name: "Student", avatarUrl: "https://img.test/student.jpg", role: "Learner", stars: 5, quote: "Great", result: "Shipped" }] },
    { kind: "gallery", id: "gallery", title: "Gallery", gallery: [{ url: "https://img.test/gallery.jpg", caption: "Workshop" }] },
    { kind: "community", id: "community", title: "Community", body: "Together" },
    { kind: "offer", id: "offer", title: "Offer", body: "Join" },
    { kind: "faq", id: "faq", title: "FAQ", faq: [{ q: "When?", a: "Now" }] },
    { kind: "magnet", id: "magnet", magnet: { title: "Guide", description: "Download", cta: "Get it" } },
]

describe("AcademySections authored variants", () => {
    it("draws the authored section switch cases in order", () => {
        const props: AcademySectionsViewProps = { sections, onSubmitLead: vi.fn() }
        const html = renderToStaticMarkup(<AcademySectionsBase {...props} />)
        expect(html).toContain("Academy")
        expect(html).toContain("Busy")
        expect(html).toContain("When?")
        expect(html).toContain("Get it")
    })
})
