import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { TileIcon } from "."

describe("TileIcon", () => {
    it("owns the console tile plate and its semantic corner signal", () => {
        const { container } = render(<TileIcon props={{ icon: "agentos", signal: "attention" }} />)
        const tile = container.firstElementChild
        expect(tile).toHaveAttribute("data-signal", "attention")
        expect(tile?.querySelector("span.absolute")).toHaveClass("bg-warning")
        expect(screen.queryByRole("img")).not.toBeInTheDocument()
    })

    it("rests without exposing a glyph", () => {
        const { container } = render(<TileIcon props={{ icon: "agentos" }} isLoading />)
        expect(container.firstElementChild).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("svg")).toBeNull()
    })
})
