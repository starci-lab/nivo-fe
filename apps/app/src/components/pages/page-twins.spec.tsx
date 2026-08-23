import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { WalletControlCenterBase as WalletPageBase } from "../blocks/wallet/WalletControlCenter/component"
import { AppsDashboardBase } from "../blocks/apps/AppsDashboard/component"
import { OverviewPageBase, type OverviewPageViewProps } from "./OverviewPage/component"
import { AgentOSWorkspaceControlCenterBase as AgentOSWorkspacePageBase, type AgentOSWorkspaceControlCenterLabels as AgentOSWorkspacePageLabels } from "../blocks/agentos/AgentOSWorkspaceControlCenter/component"
import { AgentOSSolutionModuleDetailBase as AgentOSSolutionModulePageBase, type AgentOSSolutionModuleDetailLabels as AgentOSSolutionModulePageLabels } from "../blocks/agentos/AgentOSSolutionModuleDetail/component"
import { AgentOSPageBase } from "./AgentOSPage/component"
import { TemplateAppProvisioningPageBase } from "./TemplateAppProvisioningPage/component"
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
            state="ordinary"
            title="Wallet"
            balance={{ phase: "answered", label: "Balance", actionLabel: "Top up", facts: [{ id: "b", label: "Balance", value: "100 VND" }] }}
            transactions={{ phase: "empty", label: "Transactions", note: "No transactions" }}
            invoices={{ phase: "refused", label: "Invoices", note: "Invoices unavailable" }}
            topUp={{ overlayState: "closed", title: "Top up", closeLabel: "Close", amountLabel: "Amount", amountPlaceholder: "10000", hint: "IPN", submitLabel: "Continue", amount: "", pending: false }}
            result={{ overlayState: "closed", title: "Result", closeLabel: "Close", state: "Pending", tone: "warning", amount: "100 VND", note: "Waiting", actionLabel: "Back" }}
            on={{ topUp: vi.fn(), payInvoice: vi.fn() }}
        />)
        expect(html).toContain("Wallet")
        expect(html).toContain("100 VND")
        expect(html).toContain("No transactions")
        expect(html).toContain("Invoices unavailable")
        expect(renderToStaticMarkup(<WalletPageBase
            state="ordinary"
            title="Wallet"
            balance={{ phase: "resting", label: "Balance", actionLabel: "Top up" }}
            transactions={{ phase: "refused", label: "Transactions", note: "Transactions unavailable" }}
            invoices={{ phase: "answered", label: "Invoices", rows: [{ id: "invoice-1", title: "Starter", caption: "Today", amount: "100 VND", state: "Unpaid", tone: "warning", detailLabel: "Details", detailFacts: [] }], actionLabel: "Pay" }}
            topUp={{ overlayState: "closed", title: "Top up", closeLabel: "Close", amountLabel: "Amount", amountPlaceholder: "10000", hint: "IPN", submitLabel: "Continue", amount: "", pending: false }}
            result={{ overlayState: "closed", title: "Result", closeLabel: "Close", state: "Pending", tone: "warning", amount: "100 VND", note: "Waiting", actionLabel: "Back" }}
            on={{ topUp: vi.fn(), payInvoice: vi.fn() }}
        />)).toContain("Transactions unavailable")
    })

    it("renders AppsPage owned apps and buyable catalogue offers", () => {
        const html = renderToStaticMarkup(<AppsDashboardBase
            title="Apps"
            lede="Your applications"
            buildAppLabel="Build an app"
            attentionGroupLabel="Needs attention"
            steadyGroupLabel="Running and building"
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
            accessUnavailable: "Access unavailable",
            tabsLabel: "Sections",
            tabs: [],
            summary: {} as AgentOSWorkspacePageLabels["summary"],
            applications: {} as AgentOSWorkspacePageLabels["applications"],
            runtime: {} as AgentOSWorkspacePageLabels["runtime"],
            stack: {} as AgentOSWorkspacePageLabels["stack"],
            operations: {} as AgentOSWorkspacePageLabels["operations"],
        } satisfies AgentOSWorkspacePageLabels
        const html = renderToStaticMarkup(<AgentOSWorkspacePageBase
            pageState="overview"
            controlCenterState="loading"
            labels={labels}
            launchState="idle"
            openClawLaunchHref="#"
            onSelectPageState={vi.fn()}
            onOpenAgentConsole={vi.fn()}
            formatDate={(value) => value}
        />)
        expect(html).toContain("Loading workspace")
    })

    it("renders module loading and refused projections", () => {
        const labels = {
            title: "Module",
            backToWorkspace: "Back to workspace",
            loading: "Loading module",
            refused: "Module unavailable",
            summary: { section: "Summary", module: "Module", version: "Version", status: "Status", failure: "Failure", modelProfile: "Model profile", manifest: "Manifest", empty: "None" },
            bindings: { section: "Bindings", agents: "Agents", channels: "Channels", sharedKnowledge: "Knowledge", knowledgeVersions: "Versions", artifact: "Artifact", currentness: "Currentness", embedding: "Embedding", retrievalScope: "Retrieval scope", empty: "None" },
        } satisfies AgentOSSolutionModulePageLabels
        const loading = renderToStaticMarkup(<AgentOSSolutionModulePageBase detailState="loading" labels={labels} onBack={vi.fn()} />)
        const refused = renderToStaticMarkup(<AgentOSSolutionModulePageBase detailState="refused" labels={labels} onBack={vi.fn()} />)
        expect(loading).toContain("Loading module")
        expect(loading).toContain('data-node="module-summary"')
        expect(loading).toContain('data-node="module-bindings"')
        expect(loading.match(/data-node="binding-identity-list"/g)).toHaveLength(8)
        expect(loading).toContain("Agents")
        expect(loading).toContain("Versions")
        expect(refused).toContain("Module unavailable")
        expect(refused).not.toContain('data-node="module-summary"')
        expect(refused).not.toContain('data-node="module-bindings"')
    })

    it("executes the renamed pure twins across their settled state branches", () => {
        const agentOsLabels = { path: "Path", agentos: "AgentOS", dashboardDescription: "Manage AgentOS", createTitle: "Create", createDescription: "Create AgentOS", orderTitle: "Order", orderDescription: "Resume order", createAction: "Create" }
        const agentOsActions = { onOpenDashboard: vi.fn(), onCreate: vi.fn() }
        expect(AgentOSPageBase({ mode: "dashboard", labels: agentOsLabels, ...agentOsActions })).toBeTruthy()
        expect(AgentOSPageBase({ mode: "resume", orderId: "order-1", labels: agentOsLabels, ...agentOsActions })).toBeTruthy()
        const templateLabels = { path: "Path", apps: "Apps", createTitle: "Create", createDescription: "Configure", provisioningTitle: "Provisioning", provisioningDescription: "Resume" }
        expect(TemplateAppProvisioningPageBase({ mode: "new", templateKey: "ai_academy", labels: templateLabels, onOpenApps: vi.fn() })).toBeTruthy()
        expect(TemplateAppProvisioningPageBase({ mode: "resume", siteId: "site-1", labels: templateLabels, onOpenApps: vi.fn() })).toBeTruthy()

        expect(AgentOSWorkspaceListBase({ state: "resting", props: { label: "Workspaces" } })).toBeTruthy()
        expect(AgentOSWorkspaceListBase({ state: "refused", props: { label: "Workspaces", message: "Unavailable" } })).toBeTruthy()
        expect(AgentOSWorkspaceListBase({
            state: "answered",
            props: { label: "Workspaces", rows: [{ id: "workspace-1", name: "Workspace", detail: "Order", kindLabel: "Workspace", status: "ready", statusLabel: "Ready" }] },
            on: { openWorkspace: vi.fn() },
        })).toBeTruthy()

        expect(AcademyControlCenterPageBase({ siteId: "site-1", mode: "growth", onSelectMode: vi.fn() })).toBeTruthy()
        expect(AcademyControlCenterPageBase({ siteId: "site-1", mode: "system", onSelectMode: vi.fn() })).toBeTruthy()
    })
})
