import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

const mocks = vi.hoisted(() => ({ locale: "vi", push: vi.fn() }))

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

vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/hooks", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("./component", () => ({
    AgentOSPageBase: (props: AgentOSPageProbeProps) => (
        <div>
            <output>{props.state.mode}:{props.state.orderId}</output>
            <button type="button" onClick={props.on.openDashboard}>dashboard</button>
            {props.state.mode === "dashboard"
                ? <button type="button" onClick={props.on.create}>{props.props.labels.createAction}</button>
                : null}
        </div>
    ),
}))

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const localeState = { value: "en" }
const t = (key: string) => key
const resetQueryCache = () => { for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key) }
let viewerSequence = 0
if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => signedIn }))
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

import { AgentOSPage } from "."
import { myAgentWorkspace } from "@/modules/api/console"

describe("AgentOSPage", () => {
    beforeEach(() => { mocks.locale = "vi"; mocks.push.mockClear() })

    it("routes dashboard creation without resolving child data", () => {
        render(<AgentOSPage mode="dashboard" />)
        fireEvent.click(screen.getByRole("button", { name: "agentos.purchase" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/new")
        expect(mocks.push).not.toHaveBeenCalledWith("/agentos/create")
    })

    it("keeps the primary Mua workspace purchase action on the dashboard entry", () => {
        const dashboard = render(<AgentOSPage mode="dashboard" />)
        expect(screen.getByRole("button", { name: "agentos.purchase" })).toBeInTheDocument()
        dashboard.unmount()

        render(<AgentOSPage mode="create" />)
        expect(screen.queryByRole("button", { name: "agentos.purchase" })).not.toBeInTheDocument()
    })

    it("carries the shell rev 17 purchaseAction label for the dashboard primary action", () => {
        render(<AgentOSPage mode="dashboard" />)

        expect(screen.getByRole("button", { name: "agentos.purchase" })).toBeInTheDocument()
        expect(viMessages.console.agentos.purchase).toBe("Mua workspace")
        expect(enMessages.console.agentos.purchase).toBe("Buy workspace")
    })

    it("preserves non-default locale navigation", () => {
        mocks.locale = "en"
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
            vi.doMock("next-intl", () => ({
                useTranslations: () => t,
                useLocale: () => localeState.value,
                useFormatter: () => ({ number: (value: number) => String(value), dateTime: (value: string) => value }),
            }))
            ConnectedAgentOSPage = (await import(".")).AgentOSPage
            window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
            viewerSequence += 1
            signedIn.state = { status: "signed-in", accessToken: `orchestration-pages-${viewerSequence}` }
            push.mockClear()
            replace.mockClear()
        }, 60000)
        afterEach(() => {
            vi.doUnmock("./component")
            vi.doUnmock("next-intl")
            localeState.value = "en"
            cleanup()
            resetQueryCache()
        })

        it("settles the single-business dashboard after its owner-scoped query answers", async () => {
            vi.mocked(myAgentWorkspace).mockResolvedValue({ ok: true, data: [{ id: "workspace-1", name: "Workspace", status: "ready", catalogOrder: { id: "order-1" } }] } as never)
            render(<ConnectedAgentOSPage mode="dashboard" />)
            expect(await screen.findByText("Workspace")).toBeInTheDocument()
            expect(screen.queryByRole("link", { name: "Workspace" })).toBeNull()
        })

        it("records refusal states for the single-business binding", async () => {
            vi.mocked(myAgentWorkspace).mockResolvedValue({ ok: false, reason: "unavailable" } as never)
            render(<ConnectedAgentOSPage mode="dashboard" />)
            await waitFor(() => expect(screen.getAllByText("unavailableHint").length).toBeGreaterThan(0))
        })
    })
})
