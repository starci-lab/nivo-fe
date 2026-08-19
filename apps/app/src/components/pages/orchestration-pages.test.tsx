import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const replace = vi.fn()
const signedIn = { state: { status: "signed-in", accessToken: "token" } }
const t = (key: string) => key

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace }) }))
vi.mock("next-intl", () => ({
    useTranslations: () => t,
    useLocale: () => "en",
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
    myAgentosSolutionModules: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosModuleInstallations: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosWorkspaceApplications: vi.fn().mockResolvedValue({ ok: true, data: [] }),
    myAgentosWorkspaceRuntime: vi.fn().mockResolvedValue({ ok: true, data: undefined }),
    myAgentWorkspaceControlCenter: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
    myAgentosModuleInstallation: vi.fn().mockResolvedValue({ ok: false, reason: "unavailable" }),
}))

import { AppsPage } from "./AppsPage"
import { WalletPage } from "./WalletPage"
import { AgentOSWorkspacePage } from "./AgentOSWorkspacePage"
import { AgentOSSolutionModulePage } from "./AgentOSSolutionModulePage"

describe("connected console pages", () => {
    beforeEach(() => {
        push.mockClear()
        replace.mockClear()
    })

    it("settles AppsPage into its empty catalogue state", async () => {
        render(<AppsPage />)
        expect(screen.getByText("apps.title")).toBeInTheDocument()
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
