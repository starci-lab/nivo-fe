import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type WorkspacePageProbeProps = {
    readonly props: { readonly workspaceId: string, readonly pageState: string },
    readonly on: { readonly onSelectPageState: (state: "infrastructure") => void },
}

vi.mock("./component", () => ({
    AgentOSWorkspacePageBase: ({ props, on }: WorkspacePageProbeProps) => (
        <button type="button" onClick={() => on.onSelectPageState("infrastructure")}>{props.workspaceId}:{props.pageState}</button>
    ),
}))

const navigation = vi.hoisted(() => ({ push: vi.fn(), view: "" }))
vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(navigation.view),
    redirect: vi.fn(),
    permanentRedirect: vi.fn(),
}))
vi.mock("@/hooks", async () => ({
    ...await vi.importActual("@/hooks"),
    usePathname: () => "/agentos/workspaces/workspace-1",
    useRouter: () => ({ push: navigation.push }),
    useProvisioningRealtime: () => ({ status: "disconnected", reason: null }),
}))

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const resetQueryCache = () => { for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key) }
let viewerSequence = 0
if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => signedIn }))
vi.mock("@/modules/api/expert-sites", () => ({ myExpertSites: vi.fn().mockResolvedValue({ ok: true, data: [] }) }));
vi.mock("@/modules/api/instances", () => ({ myInstances: vi.fn().mockResolvedValue({ ok: true, data: [] }) }));
vi.mock("@/modules/api/commerce", () => ({ myCatalogOrders: vi.fn().mockResolvedValue({ ok: true, data: [] }), catalogItems: vi.fn().mockResolvedValue({ ok: true, data: [] }), myWallet: vi.fn().mockResolvedValue({ ok: true, data: { balanceVnd: 0 } }), myWalletTransactions: vi.fn().mockResolvedValue({ ok: true, data: [] }), myInvoices: vi.fn().mockResolvedValue({ ok: true, data: [] }), createWalletTopUpPayLink: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }), payInvoice: vi.fn().mockResolvedValue({ ok: false, reason: "not used" }) }));
vi.mock("@/modules/api/agentos-workspaces", () => ({ myAgentWorkspace: vi.fn().mockResolvedValue({ ok: true, data: [] }), myAgentWorkspaceControlCenter: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-modules", () => ({ myAgentosModuleInstallation: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }), myAgentosSolutionModules: vi.fn().mockResolvedValue({ ok: true, data: [] }), myAgentosModuleInstallations: vi.fn().mockResolvedValue({ ok: true, data: [] }), installAgentosSolutionModule: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-module-runtime", () => ({ myAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }), manageAgentosModuleRuntime: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/agentos-module-tests", () => ({ myAgentosModuleTestSurface: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }) }));
vi.mock("@/modules/api/academy", () => ({ myAcademyGrowthSnapshot: vi.fn().mockResolvedValue({ ok: true, data: { revenueVnd: 1000, paidOrders: 1, totalMembers: 2, activeMembers: 1, totalCompletions: 3 } }) }))

import { AgentOSWorkspacePage } from "."

describe("AgentOSWorkspacePage", () => {
    it("owns the tab composition for one persisted workspace", () => {
        render(<AgentOSWorkspacePage workspaceId="workspace-1" />)
        fireEvent.click(screen.getByRole("button", { name: "workspace-1:overview" }))
        expect(navigation.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-1?view=infrastructure")
    })

    it("restores the addressable AI and Knowledge view from the URL", () => {
        navigation.view = "view=ai-knowledge"
        render(<AgentOSWorkspacePage workspaceId="workspace-1" />)
        expect(screen.getByRole("button", { name: "workspace-1:ai-knowledge" })).toBeInTheDocument()
    })

    // The connected route needs the real page component, so this block re-registers
    // `./component` for its own module registry instead of the probe above.
    describe("connected orchestration", () => {
        let ConnectedAgentOSWorkspacePage: typeof AgentOSWorkspacePage
        beforeEach(async () => {
            vi.resetModules()
            vi.doMock("./component", async () => await vi.importActual("./component"))
            vi.doMock("next/navigation", async () => ({
                ...await vi.importActual("next/navigation"),
                useSearchParams: () => new URLSearchParams(),
            }))
            ConnectedAgentOSWorkspacePage = (await import(".")).AgentOSWorkspacePage
            window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
            viewerSequence += 1
            signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}` }
            push.mockClear()
            replace.mockClear()
        }, 60000)
        afterEach(() => {
            vi.doUnmock("./component")
            vi.doUnmock("next/navigation")
            cleanup()
            resetQueryCache()
        })

        it("renders the workspace route while its snapshot is loading", async () => {
            render(<ConnectedAgentOSWorkspacePage workspaceId="workspace-1" />)
            expect(screen.getByRole("heading", { name: "workspace-1" })).toBeInTheDocument()
        })
    })
})