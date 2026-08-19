import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Badge } from "./"

/**
 * What is asserted here is the CONSEQUENCE of a prop, not that a prop was passed.
 *
 * `data-tone` and `data-loading` are the badge's own observable output: a screen reading them
 * gets the same answer a designer reading the rendered chip does. Asserting "Chip was called with
 * color=success" would pass just as happily if the mapping table were inverted.
 */
describe("Badge", () => {
    it("renders the resolved content", () => {
        render(<Badge props={{ content: "12 ngay" }} />)
        expect(screen.getByText("12 ngay")).toBeInTheDocument()
    })

    it("falls back to the neutral tone when none is stated", () => {
        const { container } = render(<Badge props={{ content: "x" }} />)
        expect(container.querySelector("[data-component='Badge']")).toHaveAttribute("data-tone", "neutral")
    })

    it("carries the stated tone through to the rendered node", () => {
        const { container } = render(<Badge props={{ content: "x", tone: "danger" }} />)
        expect(container.querySelector("[data-component='Badge']")).toHaveAttribute("data-tone", "danger")
    })

    it("hides itself from assistive technology while resting", () => {
        const { container } = render(<Badge props={{}} isLoading />)
        const node = container.querySelector("[data-component='Badge']")
        expect(node).toHaveAttribute("data-loading", "true")
        expect(node).toHaveAttribute("aria-hidden", "true")
    })

    it("is exposed to assistive technology once it has settled", () => {
        const { container } = render(<Badge props={{ content: "x" }} />)
        const node = container.querySelector("[data-component='Badge']")
        expect(node).toHaveAttribute("data-loading", "false")
        expect(node).not.toHaveAttribute("aria-hidden")
    })
})
