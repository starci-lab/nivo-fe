import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { QuickActionsList } from "./"

describe("QuickActionsList", () => {
    it("activates a selected quick action by id", () => {
        const activate = vi.fn()
        render(<QuickActionsList props={{ label: "Quick actions", items: [{ id: "home", label: "Home", icon: "home" }, { id: "saved", label: "Saved", icon: "saved" }] }} on={{ activate }} />)
        expect(screen.getByRole("listbox", { name: "Quick actions" })).toBeInTheDocument()
        expect(screen.getAllByRole("option")).toHaveLength(2)
        fireEvent.click(screen.getByRole("option", { name: "Saved" }))
        expect(activate).toHaveBeenCalledWith("saved")
    })
})