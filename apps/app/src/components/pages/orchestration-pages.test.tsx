import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const localeState = { value: "en" }
const t = (key: string) => key
if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }))
vi.mock("next-intl", () => ({
    useTranslations: () => t,
    useLocale: () => localeState.value,
    useFormatter: () => ({ number: (value: number) => String(value), dateTime: (value: string) => value }),
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => signedIn }))
vi.mock("@/modules/realtime/provisioning", () => ({ default: () => ({ status: "disconnected", reason: null }) }))
vi.mock("@/modules/api/console", () => ({
    myExpertSites: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myInstances: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myCatalogOrders: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    catalogItems: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myWallet: vi.fn().mockResolvedValue({ ok: true, data: { balanceVnd: 0 } }),
    myTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myWalletTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myInvoices: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentWorkspace: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
    myAgentWorkspaces: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosWorkspaceApplications: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosWorkspaceRuntime: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
    myAgentWorkspaceControlCenter: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosModuleInstallation: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosSolutionModules: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosModuleInstallations: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    installAgentosSolutionModule: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAcademyGrowthSnapshot: vi.fn().mockResolvedValue({ ok: true, data: { revenueVnd: 1000, paidOrders: 1, totalMembers: 2, activeMembers: 1, totalCompletions: 3 } }),
}))

import { AppsPage } from "./AppsPage"
import { WalletPage } from "./WalletPage"
import { AgentOSWorkspacePage } from "./AgentOSWorkspacePage"
import { AgentOSSolutionModulePage } from "./AgentOSSolutionModulePage"
import { AgentOSWorkspaceList } from "../blocks/agentos/AgentOSWorkspaceList"
import { myAgentWorkspace, myExpertSites, myInstances, myCatalogOrders, catalogItems, myAcademyGrowthSnapshot, myAgentosSolutionModules, myAgentosModuleInstallations, myAgentosModuleInstallation } from "@/modules/api/console"
import { AcademyGrowthSummary } from "../blocks/academy/AcademyGrowthSummary"
import { AgentOSSolutionModuleCenter } from "../blocks/agentos/AgentOSSolutionModuleCenter"

describe("connected console pages", () => {
    afterEach(() => { localeState.value = "en"; signedIn.state = { status: "signed-in", accessToken: "token" }; cleanup() })
    beforeEach(() => {
        push.mockClear()
        replace.mockClear()
    })

    it("settles AppsPage into its empty catalogue state", async () => {
        render(<AppsPage />)
        expect(screen.getByText("apps.title")).toBeInTheDocument()
    })

    it("renders owned apps, an in-progress order, and catalogue offers", async () => {
        vi.mocked(myExpertSites).mockResolvedValue({ ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null, provisionStatus: "ready", status: "active" }, { id: "site-2", slug: "unknown", customDomain: "unknown.test", provisionStatus: "awaiting_dns", status: "active" }] } as never)
        vi.mocked(myInstances).mockResolvedValue({ ok: true, data: [{ id: "instance-1", appKey: "ai_academy", detailId: "site-1", name: null, plan: null, ram: null, vcpu: null, status: "ready" }] } as never)
        vi.mocked(myCatalogOrders).mockResolvedValue({ ok: true, data: [{ id: "order-1", status: "in_progress", catalogItem: { id: "item-1", name: "Academy" }, catalogTier: { id: "tier-1", name: "Starter" } }, { id: "order-2", status: "in_progress", catalogItem: null, catalogTier: null }] } as never)
        vi.mocked(catalogItems).mockResolvedValue({ ok: true, data: [{ id: "item-1", slug: "academy", name: "Academy", tagline: "Learn", templateKey: "ai_academy", tiers: [{ id: "tier-1", tierKey: "starter", name: "Starter", priceMonthlyVnd: null, orderIndex: 0 }, { id: "tier-2", tierKey: "basic", name: "Basic", priceMonthlyVnd: 100, orderIndex: 1 }, { id: "tier-3", tierKey: "pro", name: "Pro", priceMonthlyVnd: 200, orderIndex: 2 }] }, { id: "item-2", slug: "custom", name: "Custom", tagline: null, templateKey: "custom", tiers: null }, { id: "item-3", slug: "ignored", name: "Ignored", tagline: null, templateKey: null, tiers: null }] } as never)
        render(<AppsPage />)
        await waitFor(() => expect(screen.getAllByText("Academy").length).toBeGreaterThan(0))
        for (const button of screen.getAllByRole("button")) {
            if (!button.hasAttribute("disabled")) fireEvent.click(button)
        }
    })

    it("settles the workspace list after its owner-scoped query answers", async () => {
        vi.mocked(myAgentWorkspace).mockResolvedValue({ ok: true, data: [{ id: "workspace-1", name: "Workspace", status: "ready", catalogOrder: { id: "order-1" } }] } as never)
        render(<AgentOSWorkspaceList />)
        await waitFor(() => expect(screen.getByText("agentos.workspacesLabel")).toBeInTheDocument())
        fireEvent.click(screen.getByText("Workspace"))
    })

    it("records refusal states for the workspace list", async () => {
        vi.mocked(myAgentWorkspace).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        render(<AgentOSWorkspaceList />)
        await waitFor(() => expect(screen.getAllByText("refusal.unknown").length).toBeGreaterThan(0))
    })

    it("covers AppsPage refusal and empty catalogue answers", async () => {
        cleanup()
        vi.mocked(myExpertSites).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        vi.mocked(myInstances).mockResolvedValue({ ok: true, data: [] } as never)
        vi.mocked(myCatalogOrders).mockResolvedValue({ ok: true, data: [] } as never)
        vi.mocked(catalogItems).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        render(<AppsPage />)
        await waitFor(() => expect(screen.getAllByText("refusal.unknown").length).toBeGreaterThan(0))
        cleanup()
        vi.mocked(myExpertSites).mockResolvedValue({ ok: true, data: [] } as never)
        vi.mocked(catalogItems).mockResolvedValue({ ok: true, data: [] } as never)
        render(<AppsPage />)
        await waitFor(() => expect(screen.getAllByText("apps.emptyDescription").length).toBeGreaterThan(0))
    })

    it("settles connected block twins after their owner reads", async () => {
        render(<AcademyGrowthSummary siteId="site-1" />)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        await waitFor(() => expect(myAcademyGrowthSnapshot).toHaveBeenCalledWith("site-1"))
    })

    it("renders catalog and installed module cards with their status vocabulary", async () => {
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: true, data: [{ key: "sales-copilot", name: "Sales", summary: "Assist", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }, { key: "multichannel-chatbot", name: "Chat", summary: "Chat", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }] } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: true, data: [{ id: "install-1", moduleKey: "sales-copilot", moduleVersion: "1.0", status: "ready", failureCode: null }, { id: "install-2", moduleKey: "multichannel-chatbot", moduleVersion: "1.0", status: "failed", failureCode: "BROKEN" }, { id: "install-3", moduleKey: "missing", moduleVersion: "1.0", status: "provisioning", failureCode: null }] } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        await waitFor(() => expect(screen.getByText("Sales")).toBeInTheDocument())
        fireEvent.click(screen.getByRole("tab", { name: "modes.installed" }))
    })

    it("renders an answered module installation detail", async () => {
        vi.mocked(myAgentosModuleInstallation).mockResolvedValue({ ok: true, data: { id: "install-1", agentWorkspaceId: "workspace-1", moduleKey: "sales-copilot", moduleVersion: "1.0", status: "ready", sagaId: null, generatedAgentIds: ["agent-1"], sharedKnowledgeSourceIds: ["knowledge-1"], channelAccountRefs: ["channel-1"], commonKnowledgeVersion: "common-1", privateKnowledgeVersion: "private-1", failureCode: null } } as never)
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="install-1" />)
        await waitFor(() => expect(screen.getAllByText("sales-copilot").length).toBeGreaterThan(0))
    })

    it("refuses a module detail owned by another workspace and waits while signed out", async () => {
        cleanup()
        signedIn.state = { status: "signed-out", accessToken: "" }
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="install-1" />)
        expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument()
        cleanup()
        signedIn.state = { status: "signed-in", accessToken: "token" }
        vi.mocked(myAgentosModuleInstallation).mockResolvedValue({ ok: true, data: { id: "install-1", agentWorkspaceId: "other", moduleKey: "sales-copilot", moduleVersion: "1.0", status: "ready", sagaId: null, generatedAgentIds: [], sharedKnowledgeSourceIds: [], channelAccountRefs: [], commonKnowledgeVersion: "common-1", privateKnowledgeVersion: "private-1", failureCode: null } } as never)
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="install-1" />)
        await waitFor(() => expect(screen.getAllByText("refused").length).toBeGreaterThan(0))
    })

    it("keeps module and workspace lists resting when signed out and refused when reads fail", async () => {
        signedIn.state = { status: "signed-out", accessToken: "" }
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        render(<AgentOSWorkspaceList />)
        expect(screen.getAllByText("modes.catalog").length).toBeGreaterThan(0)
        cleanup()
        signedIn.state = { status: "signed-in", accessToken: "token" }
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        await waitFor(() => expect(screen.getAllByText("refused").length).toBeGreaterThan(0))
    })

    it("covers signed-out and non-default AppsPage routing plus missing joins", async () => {
        cleanup()
        signedIn.state = { status: "signed-out", accessToken: "" }
        render(<AppsPage />)
        expect(screen.getByText("apps.title")).toBeInTheDocument()
        cleanup()
        signedIn.state = { status: "signed-in", accessToken: "token" }
        localeState.value = "vi"
        vi.mocked(myExpertSites).mockResolvedValue({ ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null, provisionStatus: "unknown", status: "active" }] } as never)
        vi.mocked(myInstances).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        vi.mocked(myCatalogOrders).mockResolvedValue({ ok: true, data: [] } as never)
        vi.mocked(catalogItems).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        render(<AppsPage />)
        await waitFor(() => expect(screen.getByText("academy")).toBeInTheDocument())
        cleanup()
        localeState.value = "vi"
        vi.mocked(myAgentWorkspace).mockResolvedValue({ ok: true, data: [{ id: "workspace-1", name: null, status: "unknown", catalogOrder: null }] } as never)
        render(<AgentOSWorkspaceList />)
        await waitFor(() => expect(screen.getAllByText("agentos.kindWorkspace").length).toBeGreaterThan(0))
        fireEvent.click(screen.getAllByRole("link", { name: "agentos.kindWorkspace" })[0])
    })

    it("settles WalletPage into empty ledgers", async () => {
        render(<WalletPage />)
        expect(screen.getByText("wallet.title")).toBeInTheDocument()
    })

    it("renders the workspace route while its snapshot is loading", async () => {
        render(<AgentOSWorkspacePage workspaceId="workspace-1" />)
        expect(screen.getByText("titleFallback")).toBeInTheDocument()
    })

    it("renders the solution module route while its detail is loading", async () => {
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="installation-1" />)
        expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument()
    })
})
