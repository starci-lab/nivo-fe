import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DualTabsToolbar } from "./DualTabsToolbar"
import { EmptyNotice } from "./EmptyNotice"
import { StreakWeekRun } from "./StreakWeekRun"

describe("EmptyNotice", () => {
    it("renders its mark, explanation, and recovery action", () => {
        const act = vi.fn()
        render(<EmptyNotice props={{ icon: "search", message: "Nothing found", description: "Try another query", actionLabel: "Retry" }} on={{ act }} />)
        expect(screen.getByText("Nothing found")).toBeInTheDocument()
        expect(screen.getByText("Try another query")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(act).toHaveBeenCalledTimes(1)
        expect(document.querySelector("[data-component='IconTile']")).toBeInTheDocument()
    })

    it("omits optional mark, detail, and action", () => {
        render(<EmptyNotice props={{ message: "No records" }} />)
        expect(screen.getByText("No records")).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
        expect(document.querySelector("[data-component='IconTile']")).not.toBeInTheDocument()
    })
})

describe("StreakWeekRun", () => {
    it("renders the supplied week", () => {
        render(<StreakWeekRun props={{ days: Array.from({ length: 7 }, (_, index) => ({ id: String(index), weekday: String(index), title: `Day ${index}`, active: index === 6 })) }} />)
        expect(document.querySelectorAll("[data-component='DayCell']")).toHaveLength(7)
        expect(screen.getByText("Day 6")).toBeInTheDocument()
    })

    it("renders seven loading placeholders when data is absent", () => {
        render(<StreakWeekRun props={{}} isLoading />)
        expect(document.querySelectorAll("[data-component='DayCell'][data-loading='true']")).toHaveLength(7)
    })
})

describe("DualTabsToolbar", () => {
    it("renders both controlled axes", () => {
        render(<DualTabsToolbar props={{ leading: { label: "Period", selectedKey: "week", tabs: [{ id: "week", label: "Week" }] }, trailing: { label: "Scope", selectedKey: "all", tabs: [{ id: "all", label: "All" }] } }} />)
        expect(screen.getByRole("tablist", { name: "Period" })).toBeInTheDocument()
        expect(screen.getByRole("tablist", { name: "Scope" })).toBeInTheDocument()
    })
})
