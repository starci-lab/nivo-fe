import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScrollViewport } from "."

const Destinations = () => <span>Destinations</span>

describe("ScrollViewport", () => {
    it("owns one keyboard-reachable labelled scroll region", () => {
        render(<ScrollViewport ariaLabel="Service destinations" content={Destinations} contentProps={{}} />)

        const viewport = screen.getByLabelText("Service destinations")
        expect(viewport).toHaveClass("scroll-viewport")
        expect(viewport).toHaveAttribute("tabindex", "0")
        expect(viewport).toHaveStyle({ overflowY: "auto", overscrollBehavior: "contain" })
        expect(screen.getByText("Destinations")).toBeInTheDocument()
    })
})
