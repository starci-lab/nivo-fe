import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { QuickActionRow } from "./"

describe("QuickActionRow", () => {
    it("renders quick action rows as labeled navigation controls", () => {
        const press = vi.fn()
        render(<QuickActionRow props={{ id: "home", label: "Home", icon: "home" }} on={{ press }} />)
        const link = screen.getByRole("link", { name: "Home" })
        expect(link).toHaveAttribute("data-part", "quick-action")
        fireEvent.click(link)
        expect(press).toHaveBeenCalledTimes(1)
    })
})