import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { MicrochipArtwork } from "."

describe("MicrochipArtwork", () => {
    it("draws red and black vector layers without a tile background", () => {
        const { container } = render(<MicrochipArtwork props={{ tone: "brand" }} />)
        const artwork = container.firstElementChild
        expect(artwork).toHaveAttribute("data-tone", "brand")
        expect(artwork).toHaveClass("h-28", "w-40")
        expect(artwork).not.toHaveClass("bg-foreground")
        expect(artwork?.querySelector("[data-layer='chip-back']")).toHaveClass("fill-foreground")
        expect(artwork?.querySelector("[data-layer='chip-face']")).toHaveClass("fill-accent", "stroke-foreground")
        expect(artwork?.querySelector("[data-layer='circuit-front']")).toHaveClass("stroke-accent")
    })

    it("keeps its artwork footprint while loading without exposing partial vectors", () => {
        const { container } = render(<MicrochipArtwork props={{}} isLoading />)
        const artwork = container.firstElementChild
        expect(artwork).toHaveAttribute("data-loading", "true")
        expect(artwork).toHaveAttribute("aria-hidden", "true")
        expect(artwork?.querySelector("svg")).not.toBeInTheDocument()
    })
})
