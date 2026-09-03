import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

/** Whether the first node is reached before the second in reading order. */
const precedes = (first: HTMLElement, second: HTMLElement) =>
    Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

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
        render(<OverviewPageBase {...props} />)

        const account = screen.getByRole("heading", { level: 2, name: "Account" })
        expect(account).toBeInTheDocument()
        expect(precedes(account, screen.getByTestId("wallet-summary"))).toBe(true)
        expect(precedes(screen.getByTestId("apps-summary"), screen.getByTestId("agentos-summary"))).toBe(true)
        expect(precedes(screen.getByTestId("wallet-summary"), screen.getByTestId("infrastructure-summary"))).toBe(true)

        const trail = screen.getByRole("list", { name: "You are here" })
        expect(within(trail).getByText("Console")).toBeInTheDocument()
        expect(within(trail).getByText("Overview")).toBeInTheDocument()
    })
})
