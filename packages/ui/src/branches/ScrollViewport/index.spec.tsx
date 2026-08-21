import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScrollViewport } from "."

describe("ScrollViewport", () => {
    it("owns one keyboard-reachable labelled scroll region", () => {
        render(<ScrollViewport ariaLabel="Service destinations" content={<span>Destinations</span>} />)

        const viewport = screen.getByLabelText("Service destinations")
        expect(viewport).toHaveAttribute("data-component", "ScrollViewport")
        expect(viewport).toHaveAttribute("tabindex", "0")
        expect(viewport).toHaveStyle({ overflowY: "auto", overscrollBehavior: "contain" })
        expect(screen.getByText("Destinations")).toBeInTheDocument()
    })
})
