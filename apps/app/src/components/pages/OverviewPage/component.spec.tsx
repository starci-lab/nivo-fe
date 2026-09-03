import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/console/OverviewPulse", () => ({ OverviewPulse: () => <div data-testid="overview-pulse" /> }))
vi.mock("@/components/blocks/console/AppsSummary", () => ({ AppsSummary: () => <div data-testid="apps-summary" /> }))
vi.mock("@/components/blocks/console/AgentOSSummary", () => ({ AgentOSSummary: () => <div data-testid="agentos-summary" /> }))
vi.mock("@/components/blocks/console/WalletSummary", () => ({ WalletSummary: () => <div data-testid="wallet-summary" /> }))
vi.mock("@/components/blocks/console/InfrastructureSummary", () => ({ InfrastructureSummary: () => <div data-testid="infrastructure-summary" /> }))

import { OverviewPageBase, type OverviewPageProps } from "./component"

const props: OverviewPageProps = {
    title: "Overview",
    lede: "Everything running and needing attention.",
    pathLabel: "You are here",
    consoleLabel: "Console",
    buildAppLabel: "Build an app",
    atAGlanceLabel: "At a glance",
    servicesLabel: "Services",
    accountLabel: "Account",
    onBuildApp: vi.fn(),
}

describe("OverviewPageBase", () => {
    it("names the briefing and its one page-level command", () => {
        const onBuildApp = vi.fn()
        render(<OverviewPageBase {...props} onBuildApp={onBuildApp} />)

        expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument()
        expect(screen.getByText("Everything running and needing attention.")).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 2, name: "At a glance" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 2, name: "Services" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 2, name: "Account" })).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Build an app" }))
        expect(onBuildApp).toHaveBeenCalledTimes(1)
    })

    it("composes the five connected summary blocks without owning their data", () => {
        render(<OverviewPageBase {...props} />)

        expect(screen.getByTestId("overview-pulse")).toBeInTheDocument()
        expect(screen.getByTestId("apps-summary")).toBeInTheDocument()
        expect(screen.getByTestId("agentos-summary")).toBeInTheDocument()
        expect(screen.getByTestId("wallet-summary")).toBeInTheDocument()
        expect(screen.getByTestId("infrastructure-summary")).toBeInTheDocument()
    })

    it("keeps services before the account rail and trails the console path", () => {
        const html = renderToStaticMarkup(<OverviewPageBase {...props} />)

        expect(html).toContain('data-grammar-layout-rail="present"')
        expect(html.indexOf("apps-summary")).toBeLessThan(html.indexOf("agentos-summary"))
        expect(html.indexOf("wallet-summary")).toBeLessThan(html.indexOf("infrastructure-summary"))
        expect(html).toContain("Console")
    })
})
