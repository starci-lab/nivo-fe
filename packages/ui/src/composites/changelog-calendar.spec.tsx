import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ChangelogEntryRow } from "./ChangelogEntryRow"
import { ContributionCalendar } from "./ContributionCalendar"

describe("ChangelogEntryRow", () => {
    it("uses an actionable title only when a handler is supplied", () => {
        const open = vi.fn()
        const { rerender } = render(<ChangelogEntryRow props={{ id: "1", dateLabel: "Jan 1", categoryLabel: "Release", title: "New API", body: "Details", isAction: true }} on={{ open }} />)
        fireEvent.click(screen.getByRole("link", { name: "New API" }))
        expect(open).toHaveBeenCalledTimes(1)
        rerender(<ChangelogEntryRow props={{ id: "1", dateLabel: "Jan 1", title: "New API", isAction: true }} />)
        expect(screen.queryByRole("link", { name: "New API" })).not.toBeInTheDocument()
        expect(screen.getByText("New API")).toBeInTheDocument()
    })
})

describe("ContributionCalendar", () => {
    it("renders summary, years, grid, and footer labels", () => {
        const selectYear = vi.fn()
        render(<ContributionCalendar props={{ year: 2024, years: [2023, 2024], totalLabel: "42 contributions", streakLabel: "7 day streak", lessLabel: "Less", moreLabel: "More", monthLabels: ["Jan"], weekdayLabels: ["Sun"], days: [{ date: "2024-01-01", count: 2, label: "2 on Jan 1" }] }} on={{ selectYear }} />)
        expect(screen.getByText("42 contributions")).toBeInTheDocument()
        expect(screen.getByText("7 day streak")).toBeInTheDocument()
        expect(screen.getByText("Less")).toBeInTheDocument()
        expect(screen.getByText("More")).toBeInTheDocument()
        expect(screen.getByRole("radio", { name: "2023" })).toBeInTheDocument()
    })
})
