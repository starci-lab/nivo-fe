import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    api: {
        myAgentWorkspace: vi.fn(), myDomains: vi.fn(), myExpertSites: vi.fn(), myInvoices: vi.fn(),
        myPodOpenclawStatus: vi.fn(), myWallet: vi.fn(),
    },
    push: vi.fn(),
    locale: "en",
    session: { state: { status: "signed-in", accessToken: "token" } },
}))

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
    useLocale: () => mocks.locale,
    useFormatter: () => ({
        number: (value: number) => `money-${value}`,
        dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}`,
    }),
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => mocks.api)
type OverviewProbeProps = {
    readonly apps: { readonly onOpenApp?: () => void }
    readonly agentOs: { readonly onOpenService?: () => void }
    readonly wallet: { readonly onOpenWallet?: () => void }
    readonly onBuildApp?: () => void
}

vi.mock("./component", () => ({
    OverviewPageBase: (props: OverviewProbeProps) => <div>
        <output data-testid="overview">{JSON.stringify(props)}</output>
        <button type="button" onClick={props.apps.onOpenApp}>apps</button>
        <button type="button" onClick={props.agentOs.onOpenService}>agentos</button>
        <button type="button" onClick={props.wallet.onOpenWallet}>wallet</button>
        <button type="button" onClick={props.onBuildApp}>build</button>
    </div>,
}))

import { OverviewPage } from "./"

const settleEmpty = () => {
    mocks.api.myExpertSites.mockResolvedValue({ ok: true, data: [] })
    mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [] })
    mocks.api.myPodOpenclawStatus.mockResolvedValue({ ok: true, data: { id: "pod" } })
    mocks.api.myDomains.mockResolvedValue({ ok: true, data: [] })
    mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 0 } })
    mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [] })
}

const overview = () => screen.getByTestId("overview").textContent ?? ""

describe("OverviewPage connected orchestration", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.locale = "en"
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        settleEmpty()
    })

    it("keeps all four summaries pending until a signed-in session can ask", () => {
        mocks.session.state = { status: "restoring", accessToken: "" }
        render(<OverviewPage />)
        expect(overview().match(/"phase":"pending"/g)).toHaveLength(8)
        expect(mocks.api.myExpertSites).not.toHaveBeenCalled()
    })

    it("settles apps, AgentOS, infrastructure domains, and wallet independently", async () => {
        mocks.api.myExpertSites.mockResolvedValue({ ok: true, data: [{ id: "site", slug: "alpha", customDomain: null, provisionStatus: "ready" }] })
        mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [{ id: "workspace", name: "Ops", status: "active" }] })
        mocks.api.myPodOpenclawStatus.mockResolvedValue({ ok: false, code: "POD_REGISTRATION_MISSING_EXCEPTION" })
        mocks.api.myDomains.mockResolvedValue({ ok: true, data: [{ id: "domain", name: "alpha.vn", autoRenew: true, expiresAt: null }] })
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 1250 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: false, code: "TRANSPORT" })
        render(<OverviewPage />)
        await waitFor(() => expect(overview()).toContain("money-1250"))
        expect(overview()).toContain("alpha.nivo.vn")
        expect(overview()).not.toContain("podReachable")
        expect(overview()).toContain('"phase":"partial"')
        expect(overview()).toContain("alpha.vn")
        expect(overview()).toContain("infrastructure.context")
    })

    it("does not invent totals for empty or refused answers", async () => {
        mocks.api.myExpertSites.mockResolvedValue({ ok: false, code: "EXPERT_SITE_NOT_FOUND_EXCEPTION" })
        mocks.api.myDomains.mockResolvedValue({ ok: false, code: "TRANSPORT" })
        render(<OverviewPage />)
        await waitFor(() => expect(overview()).toContain("refusal.EXPERT_SITE_NOT_FOUND_EXCEPTION"))
        expect(overview()).toContain("refusal.unknown")
        expect(overview()).not.toMatch(/count|total/i)
    })

    it("formats exact non-empty evidence and preserves locale-owned navigation", async () => {
        mocks.locale = "en"
        mocks.api.myExpertSites.mockResolvedValue({ ok: true, data: [{ id: "site", slug: "academy", customDomain: "learn.example", provisionStatus: "custom" }] })
        mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [{ id: "workspace", name: null, status: "custom" }] })
        mocks.api.myPodOpenclawStatus.mockResolvedValue({ ok: true, data: { id: "pod" } })
        mocks.api.myDomains.mockResolvedValue({ ok: true, data: [
            { id: "dated", name: "dated.example", autoRenew: true, expiresAt: "2026-09-01T00:00:00.000Z" },
            { id: "manual", name: "manual.example", autoRenew: false, expiresAt: null },
        ] })
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 5000 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [{ id: "invoice", status: "unpaid", amountVnd: 1200, dueAt: "2026-09-02T00:00:00.000Z" }] })
        render(<OverviewPage />)

        await waitFor(() => expect(overview()).toContain("learn.example"))
        expect(overview()).toContain("status.unknown")
        expect(overview()).toContain("date-2026-09-01")
        expect(overview()).toContain("domains.autoRenewOff")
        expect(overview()).toContain("money-1200")

        fireEvent.click(screen.getByRole("button", { name: "apps" }))
        fireEvent.click(screen.getByRole("button", { name: "agentos" }))
        fireEvent.click(screen.getByRole("button", { name: "wallet" }))
        fireEvent.click(screen.getByRole("button", { name: "build" }))

        expect(mocks.push.mock.calls).toEqual([["/en/apps"], ["/en/agentos"], ["/en/wallet"], ["/en/apps"]])
    })

    it("keeps unknown wallet and workspace refusals local", async () => {
        mocks.api.myAgentWorkspace.mockResolvedValue({ ok: false, code: "UNMAPPED" })
        mocks.api.myWallet.mockResolvedValue({ ok: false, code: "UNMAPPED" })
        render(<OverviewPage />)

        await waitFor(() => expect(overview()).toContain('"phase":"failed"'))
        expect(overview()).toContain("refusal.unknown")
    })
})
