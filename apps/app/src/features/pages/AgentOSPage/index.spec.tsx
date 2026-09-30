import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { apiAnswer, unavailableFailure } from "@/test-support/mock-result"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

const purchaseLabel = enMessages.console.agentos.purchase

const mocks = vi.hoisted(() => ({ push: vi.fn() }))

type AgentOSPageProbeProps = {
    readonly state: {
        readonly mode: string
        readonly orderId?: string
    }
    readonly props: {
        readonly labels: { readonly createAction: string }
    }
    readonly on: {
        readonly openDashboard: () => void
        readonly create: () => void
    }
}

vi.mock("@/hooks", async () => ({
    ...((await vi.importActual("@/hooks")) as Record<string, unknown>),
    useRouter: () => ({ push: mocks.push }),
    useSession: () => signedIn,
    useProvisioningRealtime: () => ({ status: "disconnected", reason: null }),
}))
vi.mock("./component", () => ({
    AgentOSPageBase: (props: AgentOSPageProbeProps) => (
        <div>
            <output>
                {props.state.mode}:{props.state.orderId}
            </output>
            <button type="button" onClick={props.on.openDashboard}>
                dashboard
            </button>
            {props.state.mode === "dashboard" ? (
                <button type="button" onClick={props.on.create}>
                    {props.props.labels.createAction}
                </button>
            ) : null}
        </div>
    ),
}))

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}
let viewerSequence = 0
if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

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

import { AgentOSPage } from "."
import { myAgentWorkspace } from "@/modules/api/agentos-workspaces"

describe("AgentOSPage", () => {
    beforeEach(() => {
        mocks.push.mockClear()
    })

    it("routes dashboard creation without resolving child data", () => {
        render(<AgentOSPage mode="dashboard" />)
        fireEvent.click(screen.getByRole("button", { name: purchaseLabel }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/new")
        expect(mocks.push).not.toHaveBeenCalledWith("/agentos/create")
    })

    it("keeps the primary Mua workspace purchase action on the dashboard entry", () => {
        const dashboard = render(<AgentOSPage mode="dashboard" />)
        expect(screen.getByRole("button", { name: purchaseLabel })).toBeInTheDocument()
        dashboard.unmount()

        render(<AgentOSPage mode="create" />)
        expect(screen.queryByRole("button", { name: purchaseLabel })).not.toBeInTheDocument()
    })

    it("carries the shell rev 17 purchaseAction label for the dashboard primary action", () => {
        render(<AgentOSPage mode="dashboard" />)

        expect(screen.getByRole("button", { name: purchaseLabel })).toBeInTheDocument()
        expect(viMessages.console.agentos.purchase).toBe("Mua workspace")
        expect(enMessages.console.agentos.purchase).toBe("Buy workspace")
    })

    it("routes back to the dashboard from a resumed order", () => {
        render(<AgentOSPage mode="resume" orderId="order-1" />)
        fireEvent.click(screen.getByRole("button", { name: "dashboard" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos")
        expect(screen.getByText("resume:order-1")).toBeInTheDocument()
    })

    // The connected binding needs the real page component, so this block re-registers
    // `./component` for its own module registry instead of the probe above.
    describe("connected orchestration", () => {
        let ConnectedAgentOSPage: typeof AgentOSPage
        beforeEach(async () => {
            vi.resetModules()
            vi.doMock("./component", async () => await vi.importActual("./component"))
            ConnectedAgentOSPage = (await import(".")).AgentOSPage
            window.matchMedia = vi
                .fn()
                .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
            viewerSequence += 1
            signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}` }
            push.mockClear()
            replace.mockClear()
        }, 60000)
        afterEach(() => {
            vi.doUnmock("./component")
            cleanup()
            resetQueryCache()
        })

        it("settles the single-business dashboard after its owner-scoped query answers", async () => {
            vi.mocked(myAgentWorkspace).mockResolvedValue(apiAnswer(myAgentWorkspace, {
                ok: true,
                data: [{ id: "workspace-1", name: "Workspace", status: "ready", catalogOrder: { id: "order-1" } }],
            }))
            render(<ConnectedAgentOSPage mode="dashboard" />)
            expect(await screen.findByText("Workspace")).toBeInTheDocument()
            expect(screen.queryByRole("link", { name: "Workspace" })).toBeNull()
        })

        it("has no axe violations", async () => {
            vi.mocked(myAgentWorkspace).mockResolvedValue(apiAnswer(myAgentWorkspace, {
                ok: true,
                data: [{ id: "workspace-1", name: "Workspace", status: "ready", catalogOrder: { id: "order-1" } }],
            }))
            const { container } = render(<ConnectedAgentOSPage mode="dashboard" />)
            await screen.findByText("Workspace")
            await expectNoA11yViolations(container)
        })

        it("records refusal states for the single-business binding", async () => {
            vi.mocked(myAgentWorkspace).mockResolvedValue(apiAnswer(myAgentWorkspace, unavailableFailure()))
            render(<ConnectedAgentOSPage mode="dashboard" />)
            await waitFor(() =>
                expect(
                    screen.getAllByText(enMessages.console.agentos.businessDashboard.unavailableHint).length,
                ).toBeGreaterThan(0),
            )
        })
    })
})
