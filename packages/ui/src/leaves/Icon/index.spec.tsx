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
        "sidebar",
    ] as const)("draws the closed console meaning %s with the leading outline cut", (name) => {
        const { container } = render(<Icon props={{ name, role: "leading" }} />)
        if (name === "sidebar") {
            expect(container.querySelector("svg")).toHaveAttribute("fill", "currentColor")
            expect(container.querySelector("path")).toHaveAttribute(
                "d",
                "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z",
            )
        } else {
            expect(container.querySelector("svg")).toHaveAttribute("stroke", "currentColor")
        }
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
