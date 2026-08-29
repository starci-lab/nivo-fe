import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ContributionGrid } from "./ContributionGrid"

describe("ContributionGrid", () => {
    it("maps counts to shades and keeps outside-year cells inert", () => {
        const { container } = render(<ContributionGrid props={{ year: 2024, monthLabels: ["Jan"], weekdayLabels: ["Sun"], days: [
            { date: "2024-01-01", count: 0, label: "none" },
            { date: "2024-01-02", count: 3, label: "three" },
            { date: "2024-01-03", count: 12, label: "twelve" },
        ] }} />)
        expect(container.querySelector("[data-date='2024-01-01']")).toHaveClass("bg-default")
        expect(container.querySelector("[data-date='2024-01-02']")).toHaveClass("bg-accent/40")
        expect(container.querySelector("[data-date='2024-01-03']")).toHaveClass("bg-accent")
        const outside = container.querySelector("[data-date='2023-12-31']")
        expect(outside).toHaveAttribute("aria-hidden", "true")
        expect(outside).not.toHaveAttribute("aria-label")
    })

    it("uses loading cells only for days in the plotted year", () => {
        const { container } = render(<ContributionGrid props={{ year: 2024, monthLabels: [], weekdayLabels: [], days: [] }} isLoading />)
        expect(container.querySelector("[data-date='2024-06-01']")).toHaveClass("animate-pulse")
        expect(container.querySelector("[data-date='2023-12-31']")).not.toHaveClass("animate-pulse")
    })
})