import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChoiceTabs } from "./"

describe("ChoiceTabs", () => {
    it("renders the selected peer choices", () => {
        render(<ChoiceTabs props={{ label: "View", selectedKey: "week", tabs: [{ id: "day", label: "Day" }, { id: "week", label: "Week" }] }} />)
        expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true")
        expect(screen.getByRole("radio", { name: "Day" })).toHaveAttribute("aria-checked", "false")
    })

    it("reports a new selection", async () => {
        const select = vi.fn()
        render(<ChoiceTabs props={{ label: "View", selectedKey: "day", tabs: [{ id: "day", label: "Day" }, { id: "week", label: "Week" }] }} on={{ select }} />)
        const week = screen.getByRole("radio", { name: "Week" })
        fireEvent.click(week)
        expect(select).toHaveBeenCalledWith("week")
    })

    it("keeps every peer choice in one horizontally reachable run", () => {
        render(<ChoiceTabs props={{ label: "Workspace area", selectedKey: "overview", tabs: [
            { id: "overview", label: "Overview" },
            { id: "solutions", label: "Solutions" },
            { id: "applications", label: "Applications" },
            { id: "infrastructure", label: "Infrastructure" },
            { id: "operations", label: "Operations" },
            { id: "access", label: "Access" },
        ] }} />)
        const choiceGroup = screen.getByRole("radiogroup", { name: "Workspace area" })
        expect(choiceGroup).toHaveClass("min-w-max")
        expect(choiceGroup.closest(".overflow-x-auto")).toBeInTheDocument()
        expect(screen.getAllByRole("radio")).toHaveLength(6)
    })
})