import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { WalletPageBase } from "./WalletPage/component"
import { AppsPageBase } from "./AppsPage/component"
import { OverviewPageBase, type OverviewPageViewProps } from "./OverviewPage/component"
import { AgentOSWorkspacePageBase, type AgentOSWorkspacePageLabels } from "./AgentOSWorkspacePage/component"
import { AgentOSSolutionModulePageBase, type AgentOSSolutionModulePageLabels } from "./AgentOSSolutionModulePage/component"

const actions = { openApps: vi.fn(), openAgentOs: vi.fn(), openWallet: vi.fn() }

const overviewProps: OverviewPageViewProps = {
    title: "Overview",
    apps: { phase: "answered", label: "Apps", openSetLabel: "Open apps", rows: [{ id: "site-1", name: "Academy", detail: "academy.test", kindLabel: "Template", status: "ready", statusLabel: "Ready", actionLabel: "Open" }] },
    agentOs: { phase: "refused", label: "AgentOS", openLabel: "Open AgentOS", note: "Unavailable", rows: [] },
    servers: { label: "Servers", note: "No standalone servers" },
    domains: { phase: "empty", label: "Domains", note: "No domains" },
    wallet: { phase: "empty", label: "Wallet", actionLabel: "Top up", facts: [{ id: "balance", label: "Balance", value: "0 VND" }] },
    on: actions,
}

describe("pure page twins", () => {
    it("renders overview answered, refused, and empty sections", () => {
        const html = renderToStaticMarkup(<OverviewPageBase {...overviewProps} />)
        expect(html).toContain("Overview")
        expect(html).toContain("Academy")
        expect(html).toContain("Unavailable")
        expect(html).toContain("No domains")
    })

    it("renders wallet resting, empty, and refused ledger branches", () => {
        const html = renderToStaticMarkup(<WalletPageBase
            title="Wallet"
            balance={{ phase: "answered", label: "Balance", actionLabel: "Top up", facts: [{ id: "b", label: "Balance", value: "100 VND" }] }}
            transactions={{ phase: "empty", label: "Transactions", note: "No transactions" }}
            invoices={{ phase: "refused", label: "Invoices", note: "Invoices unavailable" }}
            on={{ topUp: vi.fn(), payInvoice: vi.fn() }}
        />)
        expect(html).toContain("Wallet")
        expect(html).toContain("100 VND")
        expect(html).toContain("No transactions")
        expect(html).toContain("Invoices unavailable")
    })

    it("renders AppsPage owned apps and buyable catalogue offers", () => {
        const html = renderToStaticMarkup(<AppsPageBase
            title="Apps"
            lede="Your applications"
            owned={{ phase: "answered", label: "Owned", rows: [{ id: "site-1", name: "Academy", detail: "academy.test", kindLabel: "Academy", status: "ready", statusLabel: "Ready", actionLabel: "Open" }] }}
            catalogue={{ phase: "answered", label: "Catalogue", fact: "Templates", offers: [{ id: "offer-1", templateKey: "ai_academy", name: "Academy", tagline: "Learn", kindLabel: "Template", priceLabel: "100 VND", actionLabel: "Build", actionDisabled: false }] }}
            onBuildTemplate={vi.fn()}
            onOpenOwnedApp={vi.fn()}
        />)
        expect(html).toContain("Your applications")
        expect(html).toContain("Academy")
        expect(html).toContain("Build")
    })

    it("renders the workspace loading projection without requiring workspace data", () => {
        const labels = {
            titleFallback: "Workspace",
            loading: "Loading workspace",
            tabsLabel: "Sections",
            tabs: [],
            summary: {} as AgentOSWorkspacePageLabels["summary"],
            applications: {} as AgentOSWorkspacePageLabels["applications"],
            runtime: {} as AgentOSWorkspacePageLabels["runtime"],
            stack: {} as AgentOSWorkspacePageLabels["stack"],
            operations: {} as AgentOSWorkspacePageLabels["operations"],
        } satisfies AgentOSWorkspacePageLabels
        const html = renderToStaticMarkup(<AgentOSWorkspacePageBase
            state="loading"
            section="overview"
            labels={labels}
            launchState="idle"
            openClawLaunchHref="#"
            onSelectSection={vi.fn()}
            onOpenAgentConsole={vi.fn()}
            formatDate={(value) => value}
        />)
        expect(html).toContain("Loading workspace")
    })

    it("renders module loading and refused projections", () => {
        const labels = {
            title: "Module",
            loading: "Loading module",
            refused: "Module unavailable",
            summary: { section: "Summary" } as AgentOSSolutionModulePageLabels["summary"],
            bindings: { section: "Bindings" } as AgentOSSolutionModulePageLabels["bindings"],
        } satisfies AgentOSSolutionModulePageLabels
        const loading = renderToStaticMarkup(<AgentOSSolutionModulePageBase state="loading" labels={labels} />)
        const refused = renderToStaticMarkup(<AgentOSSolutionModulePageBase state="refused" labels={labels} />)
        expect(loading).toContain("Loading module")
        expect(refused).toContain("Module unavailable")
    })
})
