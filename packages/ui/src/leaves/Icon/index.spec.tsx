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

    it("leaves semantic color ownership with the surrounding state", () => {
        const { container } = render(<Icon props={{ name: "complete", role: "leading" }} />)
        expect(container.querySelector("svg")).toHaveAttribute("stroke", "currentColor")
        expect(container.querySelector("svg")).not.toHaveClass("text-success-soft-foreground")
    })

    it.each([
        "overview",
        "apps",
        "agentos",
        "servers",
        "domains",
        "wallet",
        "support",
        "collapse",
        "expand",
    ] as const)("draws the closed console meaning %s with the leading outline cut", (name) => {
        const { container } = render(<Icon props={{ name, role: "leading" }} />)
        expect(container.querySelector("svg")).toHaveAttribute("stroke", "currentColor")
        expect(container.querySelector("svg")).toHaveClass("size-5", "shrink-0")
    })

    it("uses the provider mark and loading placeholder branches", () => {
        const { container, rerender } = render(<Icon props={{ name: "google" }} />)
        expect(container.querySelector("svg")).toBeInTheDocument()
        rerender(<Icon props={{ name: "github" }} isLoading />)
        expect(container.querySelector("span")).toHaveAttribute("data-component", "Icon")
        expect(container.querySelector("span")).toHaveClass("animate-pulse")
    })
})
