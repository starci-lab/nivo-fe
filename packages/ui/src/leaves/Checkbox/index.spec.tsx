import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Checkbox } from "./"

describe("Checkbox", () => {
    it("renders a selected labeled control", () => {
        render(<Checkbox props={{ label: "Accept terms", isSelected: true, name: "terms" }} />)
        const control = screen.getByRole("checkbox", { name: "Accept terms" })
        expect(control).toBeChecked()
        expect(document.querySelector("[data-component='Checkbox']")).toHaveAttribute("data-selected", "true")
    })

    it("reports a changed selection and link follow", () => {
        const change = vi.fn()
        const follow = vi.fn()
        render(<Checkbox props={{ label: "Terms", isSelected: false, labelParts: [{ kind: "text", content: "Read " }, { kind: "link", id: "terms", label: "terms" }] }} on={{ change, follow }} />)
        fireEvent.click(screen.getByRole("checkbox"))
        fireEvent.click(screen.getByRole("link", { name: "terms" }))
        expect(change).toHaveBeenCalledWith(true)
        expect(follow).toHaveBeenCalledWith("terms")
    })
})
