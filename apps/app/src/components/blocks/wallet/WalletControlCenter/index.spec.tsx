import { cleanup, render, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"

const signedIn = { state: { status: "signed-in", accessToken: "control-center-token" } }
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}
if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

vi.mock("next/navigation", async () => ({
    ...(await vi.importActual("next/navigation")),
    useSearchParams: () => new URLSearchParams(),
}))
vi.mock("@/hooks/i18n/useRouter", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }))
vi.mock("@/hooks/i18n/usePathname", () => ({ usePathname: () => "/wallet" }))
vi.mock("@/hooks", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useProvisioningRealtime: () => ({ status: "disconnected", reason: null }),
}))

vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => signedIn }))
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

import { WalletControlCenter } from "."

describe("WalletControlCenter", () => {
    beforeEach(() => {
        window.matchMedia = vi
            .fn()
            .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    })
    afterEach(() => {
        cleanup()
        resetQueryCache()
    })

    it("has no axe violations", async () => {
        const { container } = render(<WalletControlCenter pageState="ordinary" />)
        await waitFor(() => expect(container.childElementCount).toBeGreaterThan(0))
        await waitFor(() => expect(container.querySelector("[aria-busy=true]")).toBeNull())
        await expectNoA11yViolations(container)
    })
})
