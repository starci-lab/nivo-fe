import { expectNoA11yViolations } from "@/testing/axe"
import { cleanup, render, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}
let viewerSequence = 0
if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

vi.mock("next/navigation", async () => ({
    ...(await vi.importActual("next/navigation")),
    useSearchParams: () => new URLSearchParams(),
}))
vi.mock("@/modules/i18n", async () => {
    const actual = (await vi.importActual("@/modules/i18n")) as Record<string, unknown>
    const navigation = {
        ...(actual.navigation as Record<string, unknown>),
        useRouter: () => ({ push, replace }),
        usePathname: () => "/wallet",
    }
    return { ...actual, navigation }
})
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => signedIn }))
vi.mock("@/hooks", async () => ({
    ...((await vi.importActual("@/hooks")) as Record<string, unknown>),
    useSession: () => signedIn,
    useProvisioningRealtime: () => ({ status: "disconnected", reason: null }),
}))
vi.mock("@/modules/api/expert-sites", () => ({ myExpertSites: vi.fn().mockResolvedValue({ ok: true, data: [] }) }))
vi.mock("@/modules/api/instances", () => ({ myInstances: vi.fn().mockResolvedValue({ ok: true, data: [] }) }))
vi.mock("@/modules/api/commerce", () => ({
    myCatalogOrders: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    catalogItems: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myWallet: vi.fn().mockResolvedValue({ ok: true, data: { balanceVnd: 0 } }),
    myWalletTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myInvoices: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    createWalletTopUpPayLink: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }),
    payInvoice: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }),
}))
vi.mock("@/modules/api/agentos-workspaces", () => ({
    myAgentWorkspace: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentWorkspaceControlCenter: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))
vi.mock("@/modules/api/agentos-modules", () => ({
    myAgentosModuleInstallation: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosSolutionModules: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosModuleInstallations: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    installAgentosSolutionModule: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))
vi.mock("@/modules/api/agentos-module-runtime", () => ({
    myAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    manageAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))
vi.mock("@/modules/api/agentos-module-tests", () => ({
    myAgentosModuleTestSurface: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))
vi.mock("@/modules/api/academy", () => ({
    myAcademyGrowthSnapshot: vi.fn().mockResolvedValue({
        ok: true,
        data: { revenueVnd: 1000, paidOrders: 1, totalMembers: 2, activeMembers: 1, totalCompletions: 3 },
    }),
}))

import { AcademyGrowthSummary } from "."
import { AgentOSSolutionModuleCenter } from "../../agentos/AgentOSSolutionModuleCenter"
import { myAcademyGrowthSnapshot } from "@/modules/api/academy"

describe("AcademyGrowthSummary", () => {
    afterEach(() => {
        cleanup()
        resetQueryCache()
    })
    beforeEach(() => {
        window.matchMedia = vi
            .fn()
            .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
        viewerSequence += 1
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}` }
        push.mockClear()
        replace.mockClear()
    })

    it("settles connected block twins after their owner reads", async () => {
        const { container } = render(<AcademyGrowthSummary siteId="site-1" />)
        render(<AgentOSSolutionModuleCenter workspaceId="workspace-1" />)
        await waitFor(() => expect(myAcademyGrowthSnapshot).toHaveBeenCalledWith("site-1"))
        await expectNoA11yViolations(container)
    })
})
