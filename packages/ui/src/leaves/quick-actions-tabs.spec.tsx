import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ExtendedTabs } from "./ExtendedTabs"
import { QuickActionRow } from "./QuickActionRow"
import { QuickActionsList } from "./QuickActionsList"

describe("quick actions and extended tabs", () => {
    it("renders quick action rows as labeled navigation controls", () => {
        const press = vi.fn()
        render(<QuickActionRow props={{ id: "home", label: "Home", icon: "home" }} on={{ press }} />)
        const link = screen.getByRole("link", { name: "Home" })
        expect(link).toHaveAttribute("data-part", "quick-action")
        fireEvent.click(link)
        expect(press).toHaveBeenCalledTimes(1)
    })

    it("activates a selected quick action by id", () => {
        const activate = vi.fn()
        render(<QuickActionsList props={{ label: "Quick actions", items: [{ id: "home", label: "Home", icon: "home" }, { id: "saved", label: "Saved", icon: "saved" }] }} on={{ activate }} />)
        expect(screen.getByRole("listbox", { name: "Quick actions" })).toBeInTheDocument()
        expect(screen.getAllByRole("option")).toHaveLength(2)
        fireEvent.click(screen.getByRole("option", { name: "Saved" }))
        expect(activate).toHaveBeenCalledWith("saved")
    })

    it("renders tabs, preserves panel ids, and reports selection", () => {
        const select = vi.fn()
        render(<ExtendedTabs props={{ label: "Dashboard sections", selectedKey: "activity", tabs: [{ id: "activity", label: "Activity", icon: "streak" }, { id: "tasks", label: "Tasks", icon: "complete" }] }} on={{ select }} />)
        expect(screen.getByRole("tablist", { name: "Dashboard sections" })).toBeInTheDocument()
        const tasks = screen.getByRole("tab", { name: "Tasks" })
        fireEvent.click(tasks)
        expect(select).toHaveBeenCalledWith("tasks")
    })
})