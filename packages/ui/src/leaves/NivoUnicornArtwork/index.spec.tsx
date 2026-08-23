import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NivoUnicornArtwork } from "."

describe("NivoUnicornArtwork", () => {
    it("keeps one decorative transparent mascot inside the brand-artwork band", () => {
        const { container } = render(<NivoUnicornArtwork props={{ tone: "brand" }} />)
        const artwork = container.querySelector("[data-component='NivoUnicornArtwork']")
        expect(artwork).toHaveAttribute("aria-hidden", "true")
        expect(artwork).toHaveClass("h-24", "bg-accent-soft")
        expect(artwork?.querySelector("img")).toHaveAttribute("src", "/images/nivo-unicorn-overview.png")
        expect(artwork?.querySelector("img")).toHaveAttribute("alt", "")
    })

    it("preserves the band footprint without revealing the mascot while loading", () => {
        const { container } = render(<NivoUnicornArtwork props={{}} isLoading />)
        const artwork = container.querySelector("[data-component='NivoUnicornArtwork']")
        expect(artwork).toHaveAttribute("data-loading", "true")
        expect(artwork?.querySelector("img")).not.toBeInTheDocument()
    })
})
