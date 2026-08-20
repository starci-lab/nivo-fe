import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { WalletPageBase } from "./WalletPage/component"
import { AppsPageBase } from "./AppsPage/component"
import { OverviewPageBase, type OverviewPageViewProps } from "./OverviewPage/component"
import { AgentOSWorkspacePageBase, type AgentOSWorkspacePageLabels } from "./AgentOSWorkspacePage/component"
import { AgentOSSolutionModulePageBase, type AgentOSSolutionModulePageLabels } from "./AgentOSSolutionModulePage/component"
import { AgentOSPageBase } from "./AgentOSPage/component"
import { AgentOSPage } from "./AgentOSPage"
import { TemplateAppProvisioningPageBase } from "./TemplateAppProvisioningPage/component"
import { TemplateAppProvisioningPage } from "./TemplateAppProvisioningPage"
import { AcademyControlCenterPageBase } from "./AcademyControlCenterPage/component"
import { AgentOSWorkspaceListBase } from "../blocks/agentos/AgentOSWorkspaceList/component"

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
        expect(renderToStaticMarkup(<WalletPageBase
            title="Wallet"
            balance={{ phase: "resting", label: "Balance", actionLabel: "Top up" }}
            transactions={{ phase: "refused", label: "Transactions", note: "Transactions unavailable" }}
            invoices={{ phase: "answered", label: "Invoices", facts: [{ id: "invoice-1", label: "Starter", value: "100 VND" }], actionLabel: "Pay" }}
            on={{ topUp: vi.fn(), payInvoice: vi.fn() }}
        />)).toContain("Transactions unavailable")
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

    it("executes the renamed pure twins across their settled state branches", () => {
        expect(AgentOSPageBase({ mode: "new" })).toBeTruthy()
        expect(AgentOSPageBase({ mode: "resume", orderId: "order-1" })).toBeTruthy()
        expect(AgentOSPage({ mode: "new" })).toBeTruthy()
        expect(TemplateAppProvisioningPageBase({ mode: "new", templateKey: "ai_academy" })).toBeTruthy()
        expect(TemplateAppProvisioningPageBase({ mode: "resume", siteId: "site-1" })).toBeTruthy()
        expect(TemplateAppProvisioningPage({ mode: "resume", siteId: "site-1" })).toBeTruthy()

        expect(AgentOSWorkspaceListBase({ state: "resting", props: { label: "Workspaces" } })).toBeTruthy()
        expect(AgentOSWorkspaceListBase({ state: "empty", props: { label: "Workspaces", message: "None" } })).toBeTruthy()
        expect(AgentOSWorkspaceListBase({ state: "refused", props: { label: "Workspaces", message: "Unavailable" } })).toBeTruthy()
        expect(AgentOSWorkspaceListBase({
            state: "answered",
            props: { label: "Workspaces", rows: [{ id: "workspace-1", name: "Workspace", detail: "Order", kindLabel: "Workspace", status: "ready", statusLabel: "Ready" }] },
            on: { openWorkspace: vi.fn() },
        })).toBeTruthy()

        const labels = { loading: "Loading", refused: "Refused", openSite: "Open", tabsLabel: "Mode", tabs: [{ id: "growth" as const, label: "Growth" }, { id: "system" as const, label: "System" }] }
        for (const state of ["restoring", "refused", "ready"] as const) {
            expect(AcademyControlCenterPageBase({ state, title: "Academy", siteId: "site-1", mode: "growth", labels, onSelectMode: vi.fn(), onOpenPublicSite: vi.fn() })).toBeTruthy()
        }
        expect(AcademyControlCenterPageBase({ state: "ready", title: "Academy", siteId: "site-1", publicHost: "academy.test", mode: "system", labels, onSelectMode: vi.fn(), onOpenPublicSite: vi.fn() })).toBeTruthy()
    })
})
