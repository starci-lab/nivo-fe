import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const localeState = { value: "en" }
const t = (key: string) => key
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
vi.mock("next-intl", () => ({
    useTranslations: () => t,
    useLocale: () => localeState.value,
    useFormatter: () => ({ number: (value: number) => String(value), dateTime: (value: string) => value }),
}))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => signedIn }))
vi.mock("@/hooks", async () => ({ ...(await vi.importActual("@/hooks") as Record<string, unknown>), useSession: () => signedIn }))
vi.mock("@/hooks/realtime", () => ({ default: () => ({ status: "disconnected", reason: null }) }))
vi.mock("@/modules/api/console", () => ({
    myExpertSites: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myInstances: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myCatalogOrders: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    catalogItems: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myWallet: vi.fn().mockResolvedValue({ ok: true, data: { balanceVnd: 0 } }),
    myTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myWalletTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myInvoices: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    createWalletTopUpPayLink: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }),
    payInvoice: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }),
    myAgentWorkspace: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentWorkspaces: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosWorkspaceApplications: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosWorkspaceRuntime: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
    myAgentWorkspaceControlCenter: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosModuleInstallation: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosModuleTestSurface: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    manageAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosSolutionModules: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosModuleInstallations: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosCustomModules: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    installAgentosSolutionModule: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAcademyGrowthSnapshot: vi.fn().mockResolvedValue({ ok: true, data: { revenueVnd: 1000, paidOrders: 1, totalMembers: 2, activeMembers: 1, totalCompletions: 3 } }),
}))

import { AgentOSSolutionModuleCenter } from "."
import { AgentOSCustomModuleCollection } from "../AgentOSCustomModuleCollection"
import { AgentOSPage } from "@/features/pages/AgentOSPage"
import { myAgentosSolutionModules, myAgentosModuleInstallations, myAgentosCustomModules, installAgentosSolutionModule } from "@/modules/api/console"

describe("AgentOSSolutionModuleCenter", () => {
    afterEach(() => { localeState.value = "en"; cleanup(); resetQueryCache() })
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
        fireEvent.click(screen.getByRole("radio", { name: "modes.installed" }))
    })

    it("keeps module and workspace lists resting when signed out and refused when reads fail", async () => {
        signedIn.state = { status: "signed-out", accessToken: "" }
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        render(<AgentOSPage mode="dashboard" />)
        expect(screen.getAllByText("modes.catalog").length).toBeGreaterThan(0)
        cleanup()
        resetQueryCache()
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}-list-refusal` }
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        await waitFor(() => expect(screen.getAllByText("refused").length).toBeGreaterThan(0))
    })

    it("lists installed solutions and custom modules as ledger rows with locale-prefixed destinations", async () => {
        cleanup()
        resetQueryCache()
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}-ledger` }
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: true, data: [{ key: "knowledge-hub", name: "Knowledge Hub", summary: "Reads", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }] } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: true, data: [{ id: "install-1", agentWorkspaceId: "workspace-1", moduleKey: "knowledge-hub", moduleVersion: "1.0.0", displayName: "UAT Knowledge Hub", status: "ready", failureCode: null, createdAt: "", updatedAt: "" }] } as never)
        vi.mocked(myAgentosCustomModules).mockResolvedValue({ ok: true, data: [{ id: "draft-1", agentWorkspaceId: "workspace-1", name: "Partner guide", status: "draft", progress: 40, missingFields: [], currentQuestion: null, specificationVersion: null, installationId: null, failureCode: null }, { id: "live-1", agentWorkspaceId: "workspace-1", name: "Sales copilot", status: "active", progress: 100, missingFields: [], currentQuestion: null, specificationVersion: 1, installationId: "install-1", failureCode: null }] } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" layout="ledger" />)
        render(<AgentOSCustomModuleCollection workspaceId="workspace-1" />)
        expect((await screen.findByRole("link", { name: "UAT Knowledge Hub" })).getAttribute("href")).toBe("/en/agentos/workspaces/workspace-1/modules/install-1")
        expect((await screen.findByRole("link", { name: "Partner guide" })).getAttribute("href")).toBe("/en/agentos/workspaces/workspace-1/modules/studio/draft-1")
        expect((await screen.findByRole("link", { name: "Sales copilot" })).getAttribute("href")).toBe("/en/agentos/workspaces/workspace-1/modules/install-1")
        expect(screen.queryByRole("radio")).toBeNull()
    })

    it("recovers each refused ledger section on its own and installs from the catalogue beneath", async () => {
        cleanup()
        resetQueryCache()
        viewerSequence += 1
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}-recovery` }
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        vi.mocked(myAgentosCustomModules).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" layout="ledger" />)
        render(<AgentOSCustomModuleCollection workspaceId="workspace-1" />)
        // Three reads refused, so three sections each carry their own recovery: installed, catalogue, custom.
        // The solution centre translates under its own namespace, the custom collection under `collection`.
        await waitFor(() => expect(screen.getAllByRole("button", { name: "retry" })).toHaveLength(2))
        const retries = [...screen.getAllByRole("button", { name: "retry" }), await screen.findByRole("button", { name: "collection.retry" })]
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: true, data: [{ key: "knowledge-hub", name: "Knowledge Hub", summary: "Reads", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }] } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: true, data: [{ id: "install-1", agentWorkspaceId: "workspace-1", moduleKey: "knowledge-hub", moduleVersion: "1.0.0", displayName: "UAT Knowledge Hub", status: "ready", failureCode: null, createdAt: "", updatedAt: "" }] } as never)
        vi.mocked(myAgentosCustomModules).mockResolvedValue({ ok: true, data: [{ id: "draft-1", agentWorkspaceId: "workspace-1", name: "Partner guide", status: "draft", progress: 40, missingFields: [], currentQuestion: null, specificationVersion: null, installationId: null, failureCode: null }] } as never)
        for (const retry of retries) fireEvent.click(retry)
        expect(await screen.findByRole("link", { name: "UAT Knowledge Hub" })).toBeInTheDocument()
        expect(await screen.findByRole("link", { name: "Partner guide" })).toBeInTheDocument()
        // The catalogue beneath still installs, and a refused install is reported without losing the rows above.
        fireEvent.click(await screen.findByRole("button", { name: "install" }))
        await waitFor(() => expect(installAgentosSolutionModule).toHaveBeenCalled())
        expect(await screen.findByText("installFailed")).toBeInTheDocument()
    })

    it("reuses one installation request key after an ambiguous failure and rotates it after success", async () => {
        cleanup()
        resetQueryCache()
        vi.mocked(installAgentosSolutionModule).mockClear()
        vi.mocked(myAgentosSolutionModules).mockResolvedValue({ ok: true, data: [{ key: "knowledge-hub", name: "Knowledge Hub", summary: "Reads", agentRoles: [], channelRoles: [], safetyMode: "strict", version: "1" }] } as never)
        vi.mocked(myAgentosModuleInstallations).mockResolvedValue({ ok: true, data: [] } as never)
        vi.mocked(installAgentosSolutionModule)
            .mockResolvedValueOnce({ ok: false, reason: "response lost", code: "NETWORK" } as never)
            .mockResolvedValueOnce({ ok: true, data: { id: "install-1" } } as never)
            .mockResolvedValueOnce({ ok: true, data: { id: "install-2" } } as never)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)

        fireEvent.click(await screen.findByRole("button", { name: "install" }))
        expect(await screen.findByText("installFailed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "install" }))
        await waitFor(() => expect(installAgentosSolutionModule).toHaveBeenCalledTimes(2))
        const firstKey = vi.mocked(installAgentosSolutionModule).mock.calls[0][0].idempotencyKey
        const replayKey = vi.mocked(installAgentosSolutionModule).mock.calls[1][0].idempotencyKey
        expect(replayKey).toBe(firstKey)

        fireEvent.click(screen.getByRole("radio", { name: "modes.catalog" }))
        fireEvent.click(screen.getByRole("button", { name: "install" }))
        await waitFor(() => expect(installAgentosSolutionModule).toHaveBeenCalledTimes(3))
        expect(vi.mocked(installAgentosSolutionModule).mock.calls[2][0].idempotencyKey).not.toBe(firstKey)
    })
})