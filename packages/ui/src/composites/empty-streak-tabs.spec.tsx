import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DualTabsToolbar } from "./DualTabsToolbar"
import { StreakWeekRun } from "./StreakWeekRun"

describe("StreakWeekRun", () => {
    it("renders the supplied week", () => {
        render(<StreakWeekRun props={{ days: Array.from({ length: 7 }, (_, index) => ({ id: String(index), weekday: String(index), title: `Day ${index}`, active: index === 6 })) }} />)
        expect(document.querySelectorAll("li")).toHaveLength(7)
        expect(screen.getByText("Day 6")).toBeInTheDocument()
    })

    it("renders seven loading placeholders when data is absent", () => {
        render(<StreakWeekRun props={{}} isLoading />)
        expect(document.querySelectorAll("li[data-loading='true']")).toHaveLength(7)
    })
})

describe("DualTabsToolbar", () => {
    it("renders both controlled axes", () => {
        render(<DualTabsToolbar props={{ leading: { label: "Period", selectedKey: "week", tabs: [{ id: "week", label: "Week" }] }, trailing: { label: "Scope", selectedKey: "all", tabs: [{ id: "all", label: "All" }] } }} />)
        expect(screen.getByRole("radiogroup", { name: "Period" })).toBeInTheDocument()
        expect(screen.getByRole("radiogroup", { name: "Scope" })).toBeInTheDocument()
    })
})
