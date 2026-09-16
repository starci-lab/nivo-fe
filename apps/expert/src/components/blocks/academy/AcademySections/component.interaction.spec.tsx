import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AcademySectionsBase, type AcademySectionsProps } from "./component"
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
    { kind: "custom", id: "cta", content: { variant: "cta", heading: "Start", body: "Join now", action: { label: "Join", href: "/join" } } },
    { kind: "custom", id: "image", content: { variant: "image-left", heading: "Picture", body: "See this", imageUrl: "https://img.test/picture.jpg" } },
    { kind: "custom", id: "stack", content: { variant: "stack", heading: "Stack", body: "Read", action: { label: "Read", href: "/read" } } },
    { kind: "custom", id: "bare", content: { variant: "stack" } },
]

describe("AcademySections authored variants", () => {
    it("draws the authored section switch cases in order", () => {
        const props: AcademySectionsProps = { sections, failedImageSources: new Set(), leadStatus: "idle", on: { submitLead: vi.fn(), failImage: vi.fn() } }
        const html = renderToStaticMarkup(<AcademySectionsBase {...props} />)
        expect(html).toContain("Academy")
        expect(html).toContain("Busy")
        expect(html).toContain("When?")
        expect(html).toContain("Get it")
    })

    it("forwards image failures and lead submissions to the connected owner", () => {
        const onSubmitLead = vi.fn().mockResolvedValue(true)
        const failImage = vi.fn()
        render(<AcademySectionsBase sections={sections} failedImageSources={new Set()} leadStatus="idle" on={{ submitLead: onSubmitLead, failImage }} />)
        fireEvent.error(screen.getAllByRole("img")[0])
        expect(failImage).toHaveBeenCalledWith("https://img.test/teacher.jpg")
        const lead: AcademySection = { kind: "lead", id: "lead", title: "Contact", body: "Tell us", nameLabel: "Name", phoneLabel: "Phone", submitLabel: "Send", sendingLabel: "Sending", sentMessage: "Sent", errorMessage: "Failed" }
        const view = render(<AcademySectionsBase sections={[lead]} failedImageSources={new Set()} leadStatus="idle" on={{ submitLead: onSubmitLead, failImage }} />)
        fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Reader" } })
        fireEvent.change(screen.getByLabelText("Phone"), { target: { value: "0123" } })
        fireEvent.click(screen.getByRole("button", { name: "Send" }))
        expect(onSubmitLead).toHaveBeenCalledWith({ name: "Reader", contact: "0123" })
        view.rerender(<AcademySectionsBase sections={[lead]} failedImageSources={new Set()} leadStatus="sent" on={{ submitLead: onSubmitLead, failImage }} />)
        expect(screen.getByText("Sent")).toBeInTheDocument()
    })
})
