import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ExtendedTabs } from "./"

describe("ExtendedTabs", () => {
    it("renders tabs, preserves panel ids, and reports selection", () => {
        const select = vi.fn()
        render(<ExtendedTabs props={{ label: "Dashboard sections", selectedKey: "activity", tabs: [{ id: "activity", label: "Activity", icon: "streak" }, { id: "tasks", label: "Tasks", icon: "complete" }] }} on={{ select }} />)
        expect(screen.getByRole("tablist", { name: "Dashboard sections" })).toBeInTheDocument()
        const tasks = screen.getByRole("tab", { name: "Tasks" })
        fireEvent.click(tasks)
        expect(select).toHaveBeenCalledWith("tasks")
    })
})