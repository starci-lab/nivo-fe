import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { OverviewPageBase, type AppsSectionView, type AgentOsSectionView, type DomainsSectionView, type WalletSectionView } from "./component"

const servers = { label: "Servers", note: "No servers" }
const apps: AppsSectionView = { phase: "answered", label: "Apps", openSetLabel: "Open apps", rows: [{ id: "site", name: "Alpha", detail: "alpha.vn", kindLabel: "Academy", status: "ready", statusLabel: "Ready", actionLabel: "Open" }] }
const agentOs: AgentOsSectionView = { phase: "answered", label: "AgentOS", openLabel: "Open AgentOS", rows: [{ id: "workspace", name: "Workspace", kindLabel: "Workspace", status: "active", statusLabel: "Active" }] }
const domains: DomainsSectionView = { phase: "answered", label: "Domains", facts: [{ id: "domain", label: "alpha.vn", value: "Expires 20/08" }] }
const wallet: WalletSectionView = { phase: "answered", label: "Wallet", actionLabel: "Transactions", facts: [{ id: "balance", label: "Balance", value: "1,250 ₫" }] }

const renderPage = (overrides: Partial<{ apps: AppsSectionView, agentOs: AgentOsSectionView, domains: DomainsSectionView, wallet: WalletSectionView }> = {}) =>
    renderToStaticMarkup(<OverviewPageBase title="Overview" apps={overrides.apps ?? apps} agentOs={overrides.agentOs ?? agentOs} servers={servers} domains={overrides.domains ?? domains} wallet={overrides.wallet ?? wallet} on={{ openApps: vi.fn(), openAgentOs: vi.fn(), openWallet: vi.fn() }} />)

describe("OverviewPage drawing states", () => {
    it("draws answered resource rows and facts", () => {
        const html = renderPage()
        expect(html).toContain("Overview")
        expect(html).toContain("Alpha")
        expect(html).toContain("Workspace")
        expect(html).toContain("alpha.vn")
        expect(html).toContain("1,250")
    })

    it("draws resting and empty sections", () => {
        const html = renderPage({
            apps: { phase: "resting", label: "Apps", openSetLabel: "Open apps" },
            agentOs: { phase: "empty", label: "AgentOS", plansLabel: "Plans", message: "No workspace" },
            domains: { phase: "empty", label: "Domains", note: "No domains" },
            wallet: { phase: "resting", label: "Wallet", actionLabel: "Transactions" },
        })
        expect(html).toContain("No workspace")
        expect(html).toContain("No domains")
    })

    it("draws refused sections with and without answered rows", () => {
        const html = renderPage({
            apps: { phase: "refused", label: "Apps", note: "Apps unavailable" },
            agentOs: { phase: "refused", label: "AgentOS", openLabel: "Open", note: "Pod unavailable", rows: [] },
            domains: { phase: "refused", label: "Domains", note: "Domains unavailable" },
            wallet: { phase: "refused", label: "Wallet", note: "Wallet unavailable" },
        })
        expect(html).toContain("Apps unavailable")
        expect(html).toContain("Pod unavailable")
        expect(html).toContain("Wallet unavailable")
    })

    it("draws offers and an AgentOS refusal beside workspace rows", () => {
        const html = renderPage({
            apps: { phase: "empty", label: "Apps", fact: "Build one", offers: [{ id: "offer", name: "Starter", tagline: "Simple", kindLabel: "Template", priceLabel: "money", actionLabel: "Build" }] },
            agentOs: { phase: "refused", label: "AgentOS", openLabel: "Open", note: "Pod unavailable", rows: [{ id: "workspace", name: "Workspace", kindLabel: "Workspace", status: "ready", statusLabel: "Ready" }] },
        })
        expect(html).toContain("Starter")
        expect(html).toContain("Pod unavailable")
        expect(html).toContain("Workspace")
    })
})
