import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HomePage } from "./index"

describe("HomePage", () => {
    it("renders the homepage sections and exact mascot artwork", () => {
        const { container } = render(<HomePage />)

        expect(container.querySelectorAll("h1")).toHaveLength(1)
        expect(container.querySelector("img[src*='nivo-unicorn-responsibility-transparent-v18.png']")).not.toBeNull()
        expect(container.querySelector("section[aria-labelledby='home-hero-title']")).not.toBeNull()
        expect(container.querySelector("section[aria-labelledby='home-commercial-title']")).not.toBeNull()
        expect(container.querySelector("section[aria-labelledby='home-trust-title']")).not.toBeNull()
        expect(container.querySelectorAll("[role='listitem']")).toHaveLength(3)
    })

    it("uses localized links and declares the selected language in structured data", () => {
        const { container } = render(<HomePage />)

        expect(container.querySelector('a[href="/en/nivo-os"]')).not.toBeNull()
        expect(container.querySelector('a[href="/en/contact?intent=product"]')).not.toBeNull()
        expect(container.querySelector('script[type="application/ld+json"]')?.innerHTML).toContain('"inLanguage":"en"')
    })
})
