import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const resetQueryCache = () => { for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key) }
let viewerSequence = 0
if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

vi.mock("next/navigation", async () => ({
    ...await vi.importActual("next/navigation"),
    useSearchParams: () => new URLSearchParams(),
}))
vi.mock("@/modules/i18n/navigation", async () => {
    const actual = await vi.importActual("@/modules/i18n/navigation") as Record<string, unknown>
    const navigation = { ...(actual.navigation as Record<string, unknown>), useRouter: () => ({ push, replace }), usePathname: () => "/wallet" }
    return { ...actual, navigation }
})
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => signedIn }))
vi.mock("@/hooks", async () => ({ ...(await vi.importActual("@/hooks") as Record<string, unknown>), useSession: () => signedIn, useProvisioningRealtime: () => ({ status: "disconnected", reason: null }) }))
vi.mock("@/modules/api/expert-sites", () => ({ myExpertSites: vi.fn().mockResolvedValue({ ok: true, data: [] }) }));
vi.mock("@/modules/api/instances", () => ({ myInstances: vi.fn().mockResolvedValue({ ok: true, data: [] }) }));
vi.mock("@/modules/api/commerce", () => ({ myCatalogOrders: vi.fn().mockResolvedValue({ ok: true, data: [] }), catalogItems: vi.fn().mockResolvedValue({ ok: true, data: [] }), myWallet: vi.fn().mockResolvedValue({ ok: true, data: { balanceVnd: 0 } }), myWalletTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }), myInvoices: vi.fn().mockResolvedValue({ ok: true, data: [] }), createWalletTopUpPayLink: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }), payInvoice: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }) }));
vi.mock("@/modules/api/agentos-workspaces", () => ({ myAgentWorkspace: vi.fn().mockResolvedValue({ ok: true, data: [] }), myAgentWorkspaceControlCenter: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-modules", () => ({ myAgentosModuleInstallation: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }), myAgentosSolutionModules: vi.fn().mockResolvedValue({ ok: true, data: [] }), myAgentosModuleInstallations: vi.fn().mockResolvedValue({ ok: true, data: [] }), installAgentosSolutionModule: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-module-runtime", () => ({ myAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }), manageAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-module-tests", () => ({ myAgentosModuleTestSurface: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/academy", () => ({ myAcademyGrowthSnapshot: vi.fn().mockResolvedValue({ ok: true, data: { revenueVnd: 1000, paidOrders: 1, totalMembers: 2, activeMembers: 1, totalCompletions: 3 } }) }))

import { AgentOSSolutionModuleCenter } from "."
import { AgentOSPage } from "@/features/pages/AgentOSPage"
import { myAgentosSolutionModules, myAgentosModuleInstallations, installAgentosSolutionModule } from "@/modules/api/agentos-modules"

describe("AgentOSSolutionModuleCenter", () => {
    afterEach(() => { cleanup(); resetQueryCache() })
    beforeEach(() => {
        window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
        viewerSequence += 1
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}` }
        push.mockClear()
        replace.mockClear()
    })

    it("renders catalog and installed module cards with their status vocabulary", async () => {
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: true, data: [{ key: "sales-copilot", name: "Sales", summary: "Assist", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }, { key: "multichannel-chatbot", name: "Chat", summary: "Chat", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }] } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: true, data: [{ id: "install-1", moduleKey: "sales-copilot", moduleVersion: "1.0", status: "ready", failureCode: null }, { id: "install-2", moduleKey: "multichannel-chatbot", moduleVersion: "1.0", status: "failed", failureCode: "BROKEN" }, { id: "install-3", moduleKey: "missing", moduleVersion: "1.0", status: "provisioning", failureCode: null }] } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        expect(await screen.findByText("Sales")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("radio", { name: "Installed" }))
    })

    it("keeps module and workspace lists resting when signed out and refused when reads fail", async () => {
        signedIn.state = { status: "signed-out", accessToken: "" }
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        render(<AgentOSPage mode="dashboard" />)
        expect(screen.getAllByText("Discover").length).toBeGreaterThan(0)
        cleanup()
        resetQueryCache()
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}-list-refusal` }
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        await waitFor(() => expect(screen.getAllByText("Nivo could not read the solution catalog or this workspace's modules.").length).toBeGreaterThan(0))
    })

    it("lists installed solutions as ledger rows with locale-prefixed destinations", async () => {
        cleanup()
        resetQueryCache()
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}-ledger` }
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: true, data: [{ key: "knowledge-hub", name: "Knowledge Hub", summary: "Reads", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }] } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: true, data: [{ id: "install-1", agentWorkspaceId: "workspace-1", moduleKey: "knowledge-hub", moduleVersion: "1.0.0", displayName: "UAT Knowledge Hub", status: "ready", failureCode: null, createdAt: "", updatedAt: "" }] } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" layout="ledger" />)
        expect((await screen.findByRole("link", { name: "UAT Knowledge Hub" })).getAttribute("href")).toBe("/en/agentos/workspaces/workspace-1/modules/install-1")
        expect(screen.queryByRole("radio")).toBeNull()
    })

    it("recovers each refused ledger section on its own and installs from the catalogue beneath", async () => {
        cleanup()
        resetQueryCache()
        viewerSequence += 1
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}-recovery` }
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" layout="ledger" />)
        // Two reads refused, so the two sections each carry their own recovery: installed and catalogue.
        await waitFor(() => expect(screen.getAllByRole("button", { name: "Try again" })).toHaveLength(2))
        const retries = screen.getAllByRole("button", { name: "Try again" })
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: true, data: [{ key: "knowledge-hub", name: "Knowledge Hub", summary: "Reads", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }] } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: true, data: [{ id: "install-1", agentWorkspaceId: "workspace-1", moduleKey: "knowledge-hub", moduleVersion: "1.0.0", displayName: "UAT Knowledge Hub", status: "ready", failureCode: null, createdAt: "", updatedAt: "" }] } as never)
        for (const retry of retries) fireEvent.click(retry)
        expect(await screen.findByRole("link", { name: "UAT Knowledge Hub" })).toBeInTheDocument()
        // The catalogue beneath still installs, and a refused install is reported without losing the rows above.
        fireEvent.click(await screen.findByRole("button", { name: "Install solution" }))
        await waitFor(() => expect(installAgentosSolutionModule).toHaveBeenCalled())
        expect(await screen.findByText("Nivo could not start this solution installation.")).toBeInTheDocument()
    })

    it("reuses one installation request key after an ambiguous failure and rotates it after success", async () => {
        cleanup()
        resetQueryCache()
        vi.mocked(installAgentosSolutionModule).mockClear()
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: true, data: [{ key: "knowledge-hub", name: "Knowledge Hub", summary: "Reads", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }] } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: true, data: [] } as never)
        vi.mocked(installAgentosSolutionModule)
            .mockResolvedValueOnce({ ok: false, kind: "unavailable", reason: "response lost", code: "NETWORK" } as never)
            .mockResolvedValueOnce({ ok: true, data: { id: "install-1" } } as never)
            .mockResolvedValueOnce({ ok: true, data: { id: "install-2" } } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)

        fireEvent.click(await screen.findByRole("button", { name: "Install solution" }))
        expect(await screen.findByText("Nivo could not start this solution installation.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Install solution" }))
        await waitFor(() => expect(installAgentosSolutionModule).toHaveBeenCalledTimes(2))
        const firstKey = vi.mocked(installAgentosSolutionModule).mock.calls[0][0].idempotencyKey
        const replayKey = vi.mocked(installAgentosSolutionModule).mock.calls[1][0].idempotencyKey
        expect(replayKey).toBe(firstKey)

        fireEvent.click(screen.getByRole("radio", { name: "Discover" }))
        fireEvent.click(screen.getByRole("button", { name: "Install solution" }))
        await waitFor(() => expect(installAgentosSolutionModule).toHaveBeenCalledTimes(3))
        expect(vi.mocked(installAgentosSolutionModule).mock.calls[2][0].idempotencyKey).not.toBe(firstKey)
    })
})