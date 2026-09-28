import { fireEvent, render, screen, within } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

/** Whether the first node is reached before the second in reading order. */
const precedes = (first: HTMLElement, second: HTMLElement) =>
    Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

vi.mock("@/components/blocks/console/OverviewSignals", () => ({ OverviewSignals: () => <div data-testid="overview-signals" /> }))
vi.mock("@/components/blocks/console/OverviewServices", () => ({ OverviewServices: () => <div data-testid="overview-services" /> }))
vi.mock("@/components/blocks/console/OverviewRuntime", () => ({ OverviewRuntime: () => <div data-testid="overview-runtime" /> }))
vi.mock("@/components/blocks/console/OverviewAccount", () => ({ OverviewAccount: () => <div data-testid="overview-account" /> }))
vi.mock("@/components/blocks/console/OverviewAddresses", () => ({ OverviewAddresses: () => <div data-testid="overview-addresses" /> }))

import { OverviewPageBase, type OverviewPageBaseProps } from "./component"

const props: OverviewPageBaseProps = {
    props: {
        title: "Overview",
        lede: "Everything this account runs, and the one thing to do next.",
        pathLabel: "You are here",
        consoleLabel: "Console",
        buildAppLabel: "Build an app",
        atAGlanceLabel: "At a glance",
        servicesLabel: "Services",
        accountLabel: "Account",
    },
    on: { buildApp: vi.fn() },
}

describe("OverviewPageBase", () => {
    it("names the page once and holds its one page-level command", () => {
        const buildApp = vi.fn()
        render(<OverviewPageBase {...props} on={{ buildApp }} />)

        expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument()
        expect(screen.getByText("Everything this account runs, and the one thing to do next.")).toBeInTheDocument()
        expect(screen.queryByRole("heading", { level: 2 })).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Build an app" }))
        expect(buildApp).toHaveBeenCalledTimes(1)
    })

    it("composes the five connected regions without owning their data", () => {
        render(<OverviewPageBase {...props} />)

        expect(screen.getByTestId("overview-signals")).toBeInTheDocument()
        expect(screen.getByTestId("overview-services")).toBeInTheDocument()
        expect(screen.getByTestId("overview-runtime")).toBeInTheDocument()
        expect(screen.getByTestId("overview-account")).toBeInTheDocument()
        expect(screen.getByTestId("overview-addresses")).toBeInTheDocument()
    })

    it("keeps the signal band above the tracks, services above runtime, account above addresses, and trails the console path", () => {
        render(<OverviewPageBase {...props} />)

        expect(precedes(screen.getByTestId("overview-signals"), screen.getByTestId("overview-services"))).toBe(true)
        expect(precedes(screen.getByTestId("overview-services"), screen.getByTestId("overview-runtime"))).toBe(true)
        expect(precedes(screen.getByTestId("overview-account"), screen.getByTestId("overview-addresses"))).toBe(true)

        const trail = screen.getByRole("list", { name: "You are here" })
        expect(within(trail).getByText("Console")).toBeInTheDocument()
        expect(within(trail).getByText("Overview")).toBeInTheDocument()
    })
})

describe("OverviewPageBase", () => {
    it("renders the overview anatomy around its five connected regions", () => {
        const overviewProps: OverviewPageBaseProps = {
            props: {
                title: "Overview",
                lede: "Everything this account runs, and the one thing to do next.",
                pathLabel: "You are here",
                consoleLabel: "Console",
                buildAppLabel: "Build an app",
                atAGlanceLabel: "At a glance",
                servicesLabel: "Services",
                accountLabel: "Account",
            },
            on: { buildApp: vi.fn() },
        }
        const html = renderToStaticMarkup(<OverviewPageBase {...overviewProps} />)
        expect(html).toContain("Overview")
        expect(html).toContain("overview-signals")
        expect(html).toContain("overview-services")
        expect(html).toContain("overview-runtime")
        expect(html).toContain("overview-account")
        expect(html).toContain("overview-addresses")
    })
})
