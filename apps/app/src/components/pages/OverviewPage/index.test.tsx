import { act, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
    const api = {
        catalogItems: vi.fn(),
        myAgentWorkspace: vi.fn(),
        myDomains: vi.fn(),
        myExpertSites: vi.fn(),
        myInstances: vi.fn(),
        myInvoices: vi.fn(),
        myPodOpenclawStatus: vi.fn(),
        myWallet: vi.fn(),
    }
    return {
        api,
        push: vi.fn(),
        session: { state: { status: "signed-in", accessToken: "token" } },
    }
})

type OverviewProbeProps = {
    title: string
    apps: unknown
    agentOs: unknown
    servers: unknown
    domains: unknown
    wallet: unknown
    on?: { openApps?: () => void, openAgentOs?: () => void, openWallet?: () => void }
}

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
    useLocale: () => "en",
    useFormatter: () => ({
        number: (value: number) => `money-${value}`,
        dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}`,
    }),
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => mocks.api)
vi.mock("./component", () => ({
    _OverviewPage: (props: OverviewProbeProps) => (
        <div>
            <output data-testid="overview">{JSON.stringify({ title: props.title, apps: props.apps, agentOs: props.agentOs, servers: props.servers, domains: props.domains, wallet: props.wallet })}</output>
            <button data-testid="apps" onClick={props.on?.openApps}>apps</button>
            <button data-testid="agentos" onClick={props.on?.openAgentOs}>agentos</button>
            <button data-testid="wallet" onClick={props.on?.openWallet}>wallet</button>
        </div>
    ),
}))

import { OverviewPage } from "./"

const settled = () => {
    mocks.api.myExpertSites.mockResolvedValue({ ok: true, data: [] })
    mocks.api.myInstances.mockResolvedValue({ ok: true, data: [] })
    mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [] })
    mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [] })
    mocks.api.myPodOpenclawStatus.mockResolvedValue({ ok: true, data: { id: "pod-1" } })
    mocks.api.myDomains.mockResolvedValue({ ok: true, data: [] })
    mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 0 } })
    mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [] })
}

const overview = () => screen.getByTestId("overview").textContent ?? ""

describe("OverviewPage connected orchestration", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        settled()
    })

    it("keeps every section resting while session restoration has not signed in", () => {
        mocks.session.state = { status: "restoring", accessToken: "" }
        render(<OverviewPage />)
        expect(overview()).toContain('"phase":"resting"')
        expect(mocks.api.myExpertSites).not.toHaveBeenCalled()
    })

    it("maps answered data, joins app templates, formats money and routes with locale", async () => {
        mocks.api.myExpertSites.mockResolvedValue({ ok: true, data: [{ id: "site-1", slug: "alpha", customDomain: null, provisionStatus: "awaiting_dns" }] })
        mocks.api.myInstances.mockResolvedValue({ ok: true, data: [{ detailId: "site-1", appKey: "academy" }] })
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [{ id: "item-1", name: "Academy", tagline: null, templateKey: "academy", tiers: [{ name: "Pro", priceMonthlyVnd: 900 }, { name: "Free", priceMonthlyVnd: null }] }] })
        mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [{ id: "ws-1", name: null, status: "active" }] })
        mocks.api.myPodOpenclawStatus.mockResolvedValue({ ok: false, code: "POD_REGISTRATION_MISSING_EXCEPTION" })
        mocks.api.myDomains.mockResolvedValue({ ok: true, data: [{ id: "domain-1", name: "alpha.vn", autoRenew: true, expiresAt: "2026-08-20T00:00:00.000Z" }, { id: "domain-2", name: "beta.vn", autoRenew: false, expiresAt: null }] })
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 1250 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [{ status: "unpaid", amountVnd: 500, dueAt: "2026-09-01T00:00:00.000Z" }] })

        render(<OverviewPage />)
        await waitFor(() => expect(overview()).toContain('"phase":"answered"'))
        expect(overview()).toContain("alpha.vn")
        expect(overview()).toContain("money-1250")
        expect(overview()).toContain("POD_REGISTRATION_MISSING_EXCEPTION")
        await act(async () => {
            screen.getByTestId("apps").click()
            screen.getByTestId("agentos").click()
            screen.getByTestId("wallet").click()
        })
        expect(mocks.push).toHaveBeenCalledWith("/en/apps")
        expect(mocks.push).toHaveBeenCalledWith("/en/agentos")
        expect(mocks.push).toHaveBeenCalledWith("/en/wallet")
    })

    it("maps empty catalogue, workspace, domains and zero wallet states", async () => {
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [{ id: "offer", name: "Starter", tagline: undefined, tiers: [{ name: "Monthly", priceMonthlyVnd: 1000 }, { name: "One-off", priceMonthlyVnd: null }] }] })
        render(<OverviewPage />)
        await waitFor(() => expect(overview()).toContain('"phase":"empty"'))
        expect(overview()).toContain("apps.priceTier")
        expect(overview()).toContain("servers.empty")
        expect(overview()).toContain("wallet.topUp")
    })

    it("keeps named and unknown refusals separate from answered data", async () => {
        mocks.api.myExpertSites.mockResolvedValue({ ok: false, code: "EXPERT_SITE_NOT_FOUND_EXCEPTION" })
        mocks.api.myInstances.mockResolvedValue({ ok: false, code: "TRANSPORT" })
        mocks.api.catalogItems.mockResolvedValue({ ok: false, code: "TRANSPORT" })
        mocks.api.myAgentWorkspace.mockResolvedValue({ ok: false, code: "AGENT_WORKSPACE_NOT_FOUND_EXCEPTION" })
        mocks.api.myPodOpenclawStatus.mockResolvedValue({ ok: true, data: { id: "pod" } })
        mocks.api.myDomains.mockResolvedValue({ ok: false, code: "UNKNOWN" })
        mocks.api.myWallet.mockResolvedValue({ ok: false, code: "UNKNOWN" })
        mocks.api.myInvoices.mockResolvedValue({ ok: false, code: "UNKNOWN" })
        render(<OverviewPage />)
        await waitFor(() => expect(overview()).toContain("refusal.EXPERT_SITE_NOT_FOUND_EXCEPTION"))
        expect(overview()).toContain("refusal.unknown")
    })
})
