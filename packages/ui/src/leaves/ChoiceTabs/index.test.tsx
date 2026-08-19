import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChoiceTabs } from "./"

describe("ChoiceTabs", () => {
    it("renders the selected peer choices", async () => {
        await act(async () => {
            render(<ChoiceTabs props={{ label: "View", selectedKey: "week", tabs: [{ id: "day", label: "Day" }, { id: "week", label: "Week" }] }} />)
        })
        expect(screen.getByRole("tab", { name: "Week" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "Day" })).toBeInTheDocument()
    })

    it("reports a new selection", async () => {
        const select = vi.fn()
        render(<ChoiceTabs props={{ label: "View", selectedKey: "day", tabs: [{ id: "day", label: "Day" }, { id: "week", label: "Week" }] }} on={{ select }} />)
        const week = screen.getByRole("tab", { name: "Week" })
        await act(async () => {
            fireEvent.click(week)
        })
        expect(select).toHaveBeenCalledWith("week")
    })
})
