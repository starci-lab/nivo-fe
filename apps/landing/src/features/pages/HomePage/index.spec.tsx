import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HomePage } from "./index"

describe("HomePage", () => {
    it("renders one canonical Homepage heading and the exact mascot master", () => {
        const { container } = render(<HomePage />)
        const html = container.innerHTML

        expect(container.querySelectorAll("h1")).toHaveLength(1)
        expect(html).toContain("The business operating platform")
        expect(html).toContain("nivo-unicorn-responsibility-transparent-v18.png")
        expect(html).not.toContain("home-hero__orbit")
        expect(html).toContain("home-hero__spotlight")
        expect(html).toContain("Building. Operating. Verifying.")
        expect(html).toContain("Evidence before scale.")
        expect(html).toContain("Action ≠ Outcome")
        expect(html).toContain("Outcome")
        expect(html).toContain("Core roles")
        expect(html).toContain("home-commercial__route-step")
        expect(html).not.toContain("→")
        expect(html).not.toContain("Accountability")
        expect(html).not.toContain("Boundary")
        expect(html).not.toContain("+18.7%")
    })

    it("links every internal route through the locale prefix of the request and declares that language in its structured data", () => {
        const { container } = render(<HomePage />)

        expect(container.querySelector('a[href="/en/nivo-os"]')).not.toBeNull()
        expect(container.querySelector('a[href="/en/contact?intent=product"]')).not.toBeNull()
        expect(container.querySelector('script[type="application/ld+json"]')?.innerHTML).toContain('"inLanguage":"en"')
    })
})
