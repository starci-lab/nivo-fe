import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
    const api = {
        catalogItems: vi.fn(),
        myAgentWorkspace: vi.fn(),
        myCatalogOrders: vi.fn(),
        myInvoices: vi.fn(),
        myAgentosAiKnowledgeReadiness: vi.fn(),
        orderAgentOs: vi.fn(),
        issueAgentWorkspaceAppLaunch: vi.fn(),
    }
    return {
        api,
        replace: vi.fn(),
        push: vi.fn(),
        followRedirect: vi.fn(),
        session: { state: { status: "signed-in", accessToken: "token" } },
        realtime: { status: "disconnected" as string, event: undefined as { kind: string, id: string, status?: string, reason?: string } | undefined },
        t: (key: string) => key,
    }
})

type AgentProbeProps = {
    state: string
    props: { subject: string, detail: string, statusText: string, statusActionLabel?: string, statusActionDisabled?: boolean, requestActionDisabled?: boolean, isRequestPending?: boolean }
    on?: { request?: () => void, statusAction?: () => void, selectOffer?: (id: string) => void, selectTier?: (id: string) => void }
}

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, push: mocks.push }) }))
vi.mock("next-intl", () => ({
    useTranslations: () => mocks.t,
    useLocale: () => "en",
    useFormatter: () => ({ number: (value: number) => `money-${value}` }),
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => mocks.api)
vi.mock("@/modules/realtime/provisioning", () => ({ default: () => mocks.realtime }))
vi.mock("@/modules/window/workspace-app-launch", () => ({
    safeWorkspaceAppRedirect: (url: string) => url.startsWith("https://") ? url : null,
    followWorkspaceAppRedirect: mocks.followRedirect,
}))
vi.mock("./component", () => ({
    AgentOSProvisioningBase: (props: AgentProbeProps) => (
        <div>
            <output data-testid="agent-flow">{JSON.stringify({ state: props.state, subject: props.props.subject, detail: props.props.detail, text: props.props.statusText, pending: props.props.isRequestPending, action: props.props.statusActionLabel, disabled: props.props.statusActionDisabled })}</output>
            <button data-testid="request" onClick={props.on?.request}>request</button>
            <button data-testid="select-offer" onClick={() => props.on?.selectOffer?.("item")}>select offer</button>
            <button data-testid="select-tier" onClick={() => props.on?.selectTier?.("tier")}>select tier</button>
            <button data-testid="status" onClick={props.on?.statusAction}>status</button>
        </div>
    ),
}))

import { AgentOSProvisioning } from "./"

const item = { id: "item", slug: "agent-os", name: "nivo AI Agent", tagline: "Agent team", templateKey: "agent-os", tiers: [{ id: "tier", tierKey: "pro", name: "Pro", orderIndex: 1, priceMonthlyVnd: 1000 }] }
const order = { id: "order", status: "pending_payment", catalogItem: { name: "nivo AI Agent" }, catalogTier: { name: "Pro" } }
const flow = () => screen.getByTestId("agent-flow").textContent ?? ""
const resetQueryCache = () => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
}

const snapshot = (overrides: { orders?: unknown[], invoices?: unknown[], workspaces?: unknown[], ordersResult?: unknown, invoicesResult?: unknown, workspacesResult?: unknown } = {}) => {
    mocks.api.myCatalogOrders.mockResolvedValue(overrides.ordersResult ?? { ok: true, data: overrides.orders ?? [order] })
    mocks.api.myInvoices.mockResolvedValue(overrides.invoicesResult ?? { ok: true, data: overrides.invoices ?? [] })
    mocks.api.myAgentWorkspace.mockResolvedValue(overrides.workspacesResult ?? { ok: true, data: overrides.workspaces ?? [] })
}

describe("AgentOSProvisioning", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.realtime.status = "disconnected"
        mocks.realtime.event = undefined
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [item] })
        mocks.api.orderAgentOs.mockResolvedValue({ ok: true, data: order })
        mocks.api.issueAgentWorkspaceAppLaunch.mockResolvedValue({ ok: true, data: { launchId: "launch", redirectUrl: "https://pod.example.test/launch", expiresAt: "2030-01-01T00:00:00Z" } })
        mocks.api.myAgentosAiKnowledgeReadiness.mockResolvedValue({ ok: true, data: { provider: "OpenRouter", chatModel: "deepseek/deepseek-chat", embeddingProfile: "nivo", embeddingDimension: 1024, credentialStatus: "configured", credentialMaskedHint: "or-…", qdrantHealth: "healthy", readinessStatus: "ready", aiReady: true, readinessOperationId: null, knowledgeRecoveryOperationId: null, components: [], origins: [{ origin: "nivo", version: "v1", digest: "digest", documentCount: 1, lastUpdatedAt: null }], failureCode: null, testedAt: null } })
        snapshot()
    })

    it("loads a catalogue, submits an order and opens payment", async () => {
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        expect(flow()).toContain('"subject":"agentos.productName"')
        expect(flow()).not.toContain("nivo AI Agent")
        fireEvent.click(screen.getByTestId("select-offer"))
        fireEvent.click(screen.getByTestId("select-tier"))
        fireEvent.click(screen.getByTestId("request"))
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
        expect(flow()).toContain('"subject":"agentos.productName"')
        expect(mocks.api.orderAgentOs).toHaveBeenCalledWith("agent-os", "tier")
        expect(mocks.replace).toHaveBeenCalledWith("/agentos/orders/order")
    })

    it("keeps the submit action pending while the order request is unsettled", async () => {
        let resolveOrder: ((value: { ok: true, data: typeof order }) => void) | undefined
        mocks.api.orderAgentOs.mockReturnValue(new Promise((resolve) => {
            resolveOrder = resolve
        }))
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        fireEvent.click(screen.getByTestId("select-offer"))
        fireEvent.click(screen.getByTestId("select-tier"))
        fireEvent.click(screen.getByTestId("request"))
        await waitFor(() => expect(flow()).toContain('"state":"submitting"'))
        expect(flow()).toContain('"pending":true')
        resolveOrder?.({ ok: true, data: order })
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
    })

    it("reports catalogue and submit failures and routes recovery actions", async () => {
        mocks.api.catalogItems.mockResolvedValue({ ok: false, reason: "catalog-down" })
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        expect(flow()).toContain("catalog-down")
        fireEvent.click(screen.getByTestId("status"))
        expect(mocks.push).toHaveBeenCalledWith("/agentos")

        cleanup()
        resetQueryCache()
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [item] })
        mocks.api.orderAgentOs.mockResolvedValue({ ok: false, reason: "order-down" })
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        fireEvent.click(screen.getByTestId("select-offer"))
        fireEvent.click(screen.getByTestId("select-tier"))
        fireEvent.click(screen.getByTestId("request"))
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        expect(flow()).toContain("order-down")
    })

    it("reconciles resume snapshots into missing, payment, accepted, ready and failed phases", async () => {
        snapshot({ orders: [] })
        const missing = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "missing" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        missing.unmount()
        resetQueryCache()

        snapshot({ invoices: [{ id: "invoice", status: "unpaid", catalogOrder: { id: "order" } }] })
        const unpaid = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
        unpaid.unmount()
        resetQueryCache()

        snapshot({ orders: [{ ...order, status: "in_progress" }] })
        const accepted = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"accepted"'))
        expect(flow()).toContain('"action":"agentos.watchFulfillment"')
        expect(flow()).toContain('"disabled":true')
        accepted.unmount()
        resetQueryCache()

        snapshot({ orders: [{ ...order, status: "in_progress" }], workspaces: [{ id: "workspace", status: "active", name: "Ready workspace", catalogOrder: { id: "order" } }] })
        const ready = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        ready.unmount()
        resetQueryCache()

        snapshot({ orders: [{ ...order, status: "in_progress" }], workspaces: [{ id: "workspace", status: "failed", catalogOrder: { id: "order" } }] })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
    })

    it("keeps refused payment and provisioning reads as unknown phases with a reconcile action", async () => {
        snapshot({ invoicesResult: { ok: false, reason: "invoice source refused", code: "INVOICES_REFUSED" } })
        const payment = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"payment_unknown"'))
        expect(flow()).toContain('"action":"agentos.retry"')
        expect(flow()).toContain("INVOICES_REFUSED")
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [{ id: "invoice", status: "unpaid", catalogOrder: { id: "order" } }] })
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
        payment.unmount()
        resetQueryCache()

        snapshot({ orders: [{ ...order, status: "in_progress" }], workspacesResult: { ok: false, reason: "workspace source refused", code: "WORKSPACES_REFUSED" } })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"provisioning_unknown"'))
        expect(flow()).toContain("WORKSPACES_REFUSED")
        expect(flow()).not.toContain('"state":"ready"')
    })

    it("keeps a fully refused status read as payment-unknown, not a terminal failure", async () => {
        snapshot({
            ordersResult: { ok: false, reason: "all sources refused" },
            invoicesResult: { ok: false, reason: "all sources refused" },
            workspacesResult: { ok: false, reason: "all sources refused" },
        })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"payment_unknown"'))
        expect(flow()).toContain("all sources refused")
    })

    it("turns workspace realtime events into ready and failed states", async () => {
        snapshot({ orders: [{ ...order, status: "in_progress" }], workspaces: [{ id: "workspace", status: "provisioning", catalogOrder: { id: "order" } }] })
        const view = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"preparing"'))
        mocks.realtime = { status: "event", event: { kind: "workspace", id: "workspace", status: "active" } }
        view.rerender(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        mocks.realtime = { status: "event", event: { kind: "workspace", id: "workspace", status: "failed", reason: "broken" } }
        view.rerender(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
    })

    it("routes payment and enters the ready workspace through the issued launch grant", async () => {
        snapshot({ orders: [{ ...order, status: "pending_payment" }], invoices: [{ id: "invoice", status: "unpaid", catalogOrder: { id: "order" } }] })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
        fireEvent.click(screen.getByTestId("status"))
        expect(mocks.push).toHaveBeenCalledWith("/wallet?orderId=order&invoiceId=invoice&returnTo=%2Fen%2Fagentos%2Forders%2Forder")

        cleanup()
        resetQueryCache()
        snapshot({ orders: [{ ...order, status: "in_progress" }], workspaces: [{ id: "workspace", status: "active", catalogOrder: { id: "order" } }] })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(mocks.followRedirect).toHaveBeenCalledWith("https://pod.example.test/launch"))
        expect(mocks.api.issueAgentWorkspaceAppLaunch).toHaveBeenCalledWith("workspace")
    })

    it("keeps the ready surface mounted and shows the refusal when entry is refused", async () => {
        mocks.api.issueAgentWorkspaceAppLaunch.mockResolvedValue({ ok: false, reason: "workspace not launchable" })
        snapshot({ orders: [{ ...order, status: "in_progress" }], workspaces: [{ id: "workspace", status: "active", catalogOrder: { id: "order" } }] })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("status"))
        await waitFor(() => expect(flow()).toContain("workspace not launchable"))
        expect(mocks.followRedirect).not.toHaveBeenCalled()
        expect(flow()).toContain('"state":"ready"')
    })
})
