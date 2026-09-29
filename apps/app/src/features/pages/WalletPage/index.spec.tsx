import { cleanup, render, screen } from "@testing-library/react"
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
vi.mock("@/hooks/i18n/useRouter", () => ({ useRouter: () => ({ push, replace }) }))
vi.mock("@/hooks/i18n/usePathname", () => ({ usePathname: () => "/wallet" }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => signedIn }))
vi.mock("@/modules/api/expert-sites", () => ({ myExpertSites: vi.fn().mockResolvedValue({ ok: true, data: [] }) }));
vi.mock("@/modules/api/instances", () => ({ myInstances: vi.fn().mockResolvedValue({ ok: true, data: [] }) }));
vi.mock("@/modules/api/commerce", () => ({ myCatalogOrders: vi.fn().mockResolvedValue({ ok: true, data: [] }), catalogItems: vi.fn().mockResolvedValue({ ok: true, data: [] }), myWallet: vi.fn().mockResolvedValue({ ok: true, data: { balanceVnd: 0 } }), myWalletTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }), myInvoices: vi.fn().mockResolvedValue({ ok: true, data: [] }), createWalletTopUpPayLink: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }), payInvoice: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }) }));
vi.mock("@/modules/api/agentos-workspaces", () => ({ myAgentWorkspace: vi.fn().mockResolvedValue({ ok: true, data: [] }), myAgentWorkspaceControlCenter: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-modules", () => ({ myAgentosModuleInstallation: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }), myAgentosSolutionModules: vi.fn().mockResolvedValue({ ok: true, data: [] }), myAgentosModuleInstallations: vi.fn().mockResolvedValue({ ok: true, data: [] }), installAgentosSolutionModule: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-module-runtime", () => ({ myAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }), manageAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-module-tests", () => ({ myAgentosModuleTestSurface: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-module-studio", () => ({ myAgentosCustomModules: vi.fn().mockResolvedValue({ ok: true, data: [] }) }));
vi.mock("@/modules/api/academy", () => ({ myAcademyGrowthSnapshot: vi.fn().mockResolvedValue({ ok: true, data: { revenueVnd: 1000, paidOrders: 1, totalMembers: 2, activeMembers: 1, totalCompletions: 3 } }) }))

import { WalletPage } from "."
import enMessages from "@/messages/en.json"

describe("WalletPage", () => {
    afterEach(() => { cleanup(); resetQueryCache() })
    beforeEach(() => {
        window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
        viewerSequence += 1
        signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}` }
        push.mockClear()
        replace.mockClear()
    })

    it("settles WalletPage into empty ledgers", async () => {
        render(<WalletPage />)
        expect(screen.getAllByText(enMessages.console.wallet.title).length).toBeGreaterThan(0)
    })
})