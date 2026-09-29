import { describe, expect, it } from "vitest"
import { academySectionsOf } from "./academy-sections"

const copy = {
    hero: { tryFree: "Try", seeCourses: "Courses" },
    problems: { title: "Problems" },
    outcomes: { title: "Outcomes", first: "One", second: "Two", third: "Three" },
    roadmap: { title: "Roadmap" },
    testimonials: { title: "Testimonials" },
    gallery: { title: "Gallery" },
    courses: { title: "Courses", emptyTitle: "No courses", emptyBody: "Come back" },
    community: { title: "Community", body: "Together" },
    offer: { title: "Offer", body: "Join" },
    faq: { title: "FAQ" },
    lead: { title: "Contact", body: "Tell us", name: "Name", phone: "Phone", submit: "Send", sending: "Sending", sent: "Sent", error: "Failed" },
}

describe("academySectionsOf", () => {
    it("settles visible system sections with product copy and the supplied catalog", () => {
        const sections = academySectionsOf([], "en", copy)
        expect(sections.find((section) => section.kind === "hero")).toMatchObject({
            kind: "hero",
            tryFreeLabel: "Try",
            seeCoursesLabel: "Courses",
        })
        expect(sections.find((section) => section.kind === "courses")).toMatchObject({
            kind: "courses",
            courses: [],
            emptyTitle: "No courses",
        })
    })
})
