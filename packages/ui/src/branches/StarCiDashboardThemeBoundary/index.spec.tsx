import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StarCiDashboardThemeBoundary } from "."

const Dashboard = () => <span>Dashboard</span>

describe("StarCiDashboardThemeBoundary", () => {
    it("binds dashboard content to the shared visual theme", () => {
        render(<StarCiDashboardThemeBoundary content={Dashboard} contentProps={{}} />)

        const boundary = screen.getByText("Dashboard").parentElement
        expect(boundary).toHaveClass("starci-dashboard-theme")
    })
})
