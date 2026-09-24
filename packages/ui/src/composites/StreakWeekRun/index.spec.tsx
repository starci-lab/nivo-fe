import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StreakWeekRun } from "./"

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