import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StarCiDashboardThemeBoundary } from "."

describe("StarCiDashboardThemeBoundary", () => {
    it("binds projected dashboard content to the strict visual contract", () => {
        render(<StarCiDashboardThemeBoundary content={<span>Dashboard</span>} />)

        const boundary = screen.getByText("Dashboard").parentElement
        expect(boundary).toHaveAttribute("data-theme", "starci-dashboard")
        expect(boundary).toHaveAttribute("data-visual-contract", "starci-dashboard-theme")
    })
})
