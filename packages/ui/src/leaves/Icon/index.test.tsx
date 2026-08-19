import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Icon } from "./"

describe("Icon", () => {
    it.each([
        ["heading", "size-6"],
        ["leading", "size-5"],
        ["chip", "size-4"],
    ] as const)("uses the %s role size", (role, size) => {
        const { container } = render(<Icon props={{ name: "search", role }} />)
        expect(container.querySelector("svg")).toHaveClass(size, "shrink-0")
    })

    it("marks the complete glyph with its success color", () => {
        const { container } = render(<Icon props={{ name: "complete", role: "leading" }} />)
        expect(container.querySelector("svg")).toHaveClass("text-success-soft-foreground")
    })

    it("uses the provider mark and loading placeholder branches", () => {
        const { container, rerender } = render(<Icon props={{ name: "google" }} />)
        expect(container.querySelector("svg")).toBeInTheDocument()
        rerender(<Icon props={{ name: "github" }} isLoading />)
        expect(container.querySelector("span")).toHaveAttribute("data-component", "Icon")
        expect(container.querySelector("span")).toHaveClass("animate-pulse")
    })
})
