import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { NivoBrand } from "."

describe("NivoBrand", () => {
    it("draws one accessible protected lockup with token-owned artwork classes", () => {
        const { container } = render(<NivoBrand props={{ label: "nivo", variant: "lockup", scale: "navbar" }} />)

        expect(screen.getByRole("img", { name: "nivo" })).toBeInTheDocument()
        expect(container.querySelector("[data-part='wordmark']")).toHaveClass("nivo-brand__ink")
        expect(container.querySelectorAll("[data-part='orbit'] path")).toHaveLength(4)
        expect(container.innerHTML).not.toMatch(/#[0-9a-f]{3,8}/i)
    })

    it("uses the standalone mark for hero identity and hides partial artwork while loading", () => {
        const { container, rerender } = render(<NivoBrand props={{ label: "nivo", variant: "mark", scale: "hero" }} />)
        const brand = container.firstElementChild

        expect(brand).toHaveAttribute("data-variant", "mark")
        expect(brand).toHaveClass("h-20")
        expect(container.querySelector("[data-part='wordmark']")).not.toBeInTheDocument()

        rerender(<NivoBrand props={{ label: "nivo" }} isLoading />)
        expect(container.querySelector("svg")).not.toBeInTheDocument()
        expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
    })
})
