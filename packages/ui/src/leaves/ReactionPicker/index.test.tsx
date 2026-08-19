import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ReactionPicker } from "./"
import { ReactionType } from "./reaction-type"

const choices = [
    { id: ReactionType.Like, label: "Like" },
    { id: ReactionType.Love, label: "Love" },
]

describe("ReactionPicker", () => {
    it("omits an empty read-only summary", () => {
        const { container } = render(<ReactionPicker props={{ label: "React", count: 0, choices }} />)
        expect(container).toBeEmptyDOMElement()
    })

    it("renders a selected read-only summary with its count", () => {
        render(<ReactionPicker props={{ label: "React", count: 3, selected: ReactionType.Love, choices }} />)
        expect(screen.getByText("3")).toBeInTheDocument()
        expect(document.querySelector("img")).toHaveAttribute("src", "/reactions/love.svg")
    })

    it("opens, toggles the selected reaction, and closes on selection", () => {
        const select = vi.fn()
        render(<ReactionPicker props={{ label: "React", count: 1, selected: ReactionType.Like, choices }} on={{ select }} />)
        const trigger = screen.getByRole("button", { name: "React" })
        fireEvent.click(trigger)
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        fireEvent.click(screen.getByRole("button", { name: "Like" }))
        expect(select).toHaveBeenCalledWith(null)
        expect(trigger).toHaveAttribute("aria-expanded", "false")
    })

    it("closes for escape and outside pointer input", () => {
        const { container } = render(<ReactionPicker props={{ label: "React", count: 1, choices }} on={{ select: vi.fn() }} />)
        const trigger = screen.getByRole("button", { name: "React" })
        fireEvent.click(trigger)
        fireEvent.keyDown(document, { key: "Escape" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        fireEvent.click(trigger)
        fireEvent.pointerDown(document.body)
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        expect(container.querySelector("button")).not.toBeDisabled()
    })

    it("disables the trigger while a reaction is pending", () => {
        render(<ReactionPicker props={{ label: "React", count: 1, choices, isPending: true }} on={{ select: vi.fn() }} />)
        expect(screen.getByRole("button", { name: "React" })).toBeDisabled()
    })
})
