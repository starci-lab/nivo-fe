import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { OverviewPageBase, type OverviewPageViewProps } from "./component"

const props: OverviewPageViewProps = {
    title: "Overview",
    lede: "Everything running and needing attention.",
    buildAppLabel: "Build an app",
    pulse: { signals: [
        { id: "apps", icon: "apps", label: "Apps", phase: "answered", value: "Academy", caption: "Running" },
        { id: "agentos", icon: "agentos", label: "AgentOS", phase: "answered", value: "sales-ops", caption: "Ready" },
        { id: "domains", icon: "domains", label: "Domains", phase: "failed", value: "—", caption: "Unavailable" },
        { id: "wallet", icon: "wallet", label: "Wallet", phase: "answered", value: "0 VND", caption: "No invoice", emphasis: "accent" },
    ] },
    apps: { label: "Apps", state: { phase: "empty", message: "No apps" }, onOpenApp: vi.fn() },
    agentOs: { label: "AgentOS", state: { phase: "empty", message: "No workspace" }, onOpenService: vi.fn() },
    infrastructure: { label: "Infrastructure", context: "No built services", domains: { phase: "empty", note: "No domains" } },
    wallet: { label: "Wallet", state: { phase: "empty", facts: [{ id: "balance", label: "Balance", value: "0 VND" }] } },
    onBuildApp: vi.fn(),
}

describe("OverviewPage drawing", () => {
    it("composes the four accepted summary blocks in reading order", () => {
        const html = renderToStaticMarkup(<OverviewPageBase {...props} />)
        expect(html.indexOf("No apps")).toBeLessThan(html.indexOf("No workspace"))
        expect(html.indexOf("No workspace")).toBeLessThan(html.indexOf("Infrastructure"))
        expect(html.indexOf("Wallet")).toBeLessThan(html.indexOf("Infrastructure"))
        expect(html).toContain("No domains")
        expect(html).toContain("0 VND")
    })

    it("keeps the overview pulse and primary-aside page owner in the complete composition", () => {
        const html = renderToStaticMarkup(<OverviewPageBase {...props} />)
        expect(html).toContain('data-scale="display"')
        expect(html).toContain("Build an app")
    })

    it("normalizes populated legacy summaries and preserves their actions", () => {
        const openApps = vi.fn()
        const openAgentOs = vi.fn()
        const openWallet = vi.fn()
        const legacy: OverviewPageViewProps = {
            title: "Legacy overview",
            apps: { phase: "answered", label: "Apps", openSetLabel: "Open apps", rows: [{ id: "app", name: "Academy", detail: "academy.example", status: "failed", statusLabel: "Failed", actionLabel: "Open" }] },
            agentOs: { phase: "refused", label: "AgentOS", openLabel: "Open AgentOS", note: "Runtime unavailable", rows: [{ id: "workspace", name: "Ops", status: "awaiting_dns", statusLabel: "Waiting" }] },
            servers: { label: "Servers", note: "One service exists" },
            domains: { phase: "answered", label: "Domains", facts: [{ id: "domain", label: "example.test", value: "Active" }] },
            wallet: { phase: "refused", label: "Wallet", note: "Wallet unavailable" },
            on: { openApps, openAgentOs, openWallet },
        }
        render(<OverviewPageBase {...legacy} />)

        fireEvent.click(screen.getByRole("button", { name: "Open" }))
        fireEvent.click(screen.getByRole("button", { name: "Open AgentOS" }))

        expect(openApps).toHaveBeenCalledTimes(1)
        expect(openAgentOs).toHaveBeenCalledTimes(1)
        expect(screen.getByText("Wallet unavailable")).toBeInTheDocument()
    })

    it("normalizes every unsettled legacy phase without inventing values", () => {
        const phases: ReadonlyArray<OverviewPageViewProps> = [
            {
                title: "Pending",
                apps: { phase: "resting", label: "Apps", openSetLabel: "Open apps" },
                agentOs: { phase: "resting", label: "AgentOS", openLabel: "Open AgentOS" },
                servers: { label: "Servers", note: "Pending" },
                domains: { phase: "resting", label: "Domains" },
                wallet: { phase: "resting", label: "Wallet", actionLabel: "Open wallet" },
            },
            {
                title: "Empty",
                apps: { phase: "empty", label: "Apps", fact: "No apps", offers: [] },
                agentOs: { phase: "empty", label: "AgentOS", plansLabel: "Plans", message: "No workspace" },
                servers: { label: "Servers", note: "No services" },
                domains: { phase: "empty", label: "Domains", note: "No domains" },
                wallet: { phase: "empty", label: "Wallet", actionLabel: "Top up", facts: [] },
            },
            {
                title: "Refused",
                apps: { phase: "refused", label: "Apps", note: "Apps unavailable" },
                agentOs: { phase: "refused", label: "AgentOS", openLabel: "Open AgentOS", note: "AgentOS unavailable", rows: [] },
                servers: { label: "Servers", note: "Unknown" },
                domains: { phase: "refused", label: "Domains", note: "Domains unavailable" },
                wallet: { phase: "answered", label: "Wallet", actionLabel: "Open wallet", facts: [{ id: "balance", label: "Balance", value: "0" }] },
            },
        ]

        for (const phase of phases) {
            expect(renderToStaticMarkup(<OverviewPageBase {...phase} />)).toContain(phase.title)
        }
    })
})
