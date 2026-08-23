import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
    const api = {
        catalogItems: vi.fn(),
        myAgentWorkspace: vi.fn(),
        myCatalogOrders: vi.fn(),
        myInvoices: vi.fn(),
        myAgentosAiKnowledgeReadiness: vi.fn(),
        orderAgentOs: vi.fn(),
    }
    return {
        api,
        replace: vi.fn(),
        push: vi.fn(),
        session: { state: { status: "signed-in", accessToken: "token" } },
        realtime: { status: "disconnected" as string, event: undefined as { kind: string, id: string, status?: string, reason?: string } | undefined },
        t: (key: string) => key,
    }
})

type AgentProbeProps = {
    state: string
    props: { subject: string, detail: string, statusText: string, statusActionLabel?: string, statusActionDisabled?: boolean, isRequestPending?: boolean }
    on?: { request?: () => void, statusAction?: () => void }
}

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace, push: mocks.push }) }))
vi.mock("next-intl", () => ({
    useTranslations: () => mocks.t,
    useLocale: () => "en",
    useFormatter: () => ({ number: (value: number) => `money-${value}` }),
}))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => mocks.api)
vi.mock("@/modules/realtime/provisioning", () => ({ default: () => mocks.realtime }))
vi.mock("./component", () => ({
    AgentOSProvisioningBase: (props: AgentProbeProps) => (
        <div>
            <output data-testid="agent-flow">{JSON.stringify({ state: props.state, subject: props.props.subject, detail: props.props.detail, text: props.props.statusText, pending: props.props.isRequestPending, action: props.props.statusActionLabel, disabled: props.props.statusActionDisabled })}</output>
            <button data-testid="request" onClick={props.on?.request}>request</button>
            <button data-testid="status" onClick={props.on?.statusAction}>status</button>
        </div>
    ),
}))

import { AgentOSProvisioning } from "./"

const item = { id: "item", slug: "agent-os", name: "nivo AI Agent", tiers: [{ id: "tier", name: "Pro", orderIndex: 1, priceMonthlyVnd: 1000 }] }
const order = { id: "order", status: "pending_payment", catalogItem: { name: "nivo AI Agent" }, catalogTier: { name: "Pro" } }
const flow = () => screen.getByTestId("agent-flow").textContent ?? ""

const snapshot = (overrides: { orders?: unknown[], invoices?: unknown[], workspaces?: unknown[] } = {}) => {
    mocks.api.myCatalogOrders.mockResolvedValue({ ok: true, data: overrides.orders ?? [order] })
    mocks.api.myInvoices.mockResolvedValue({ ok: true, data: overrides.invoices ?? [] })
    mocks.api.myAgentWorkspace.mockResolvedValue({ ok: true, data: overrides.workspaces ?? [] })
}

describe("AgentOSProvisioning connected flow", () => {
    afterEach(() => cleanup())

    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.realtime.status = "disconnected"
        mocks.realtime.event = undefined
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [item] })
        mocks.api.orderAgentOs.mockResolvedValue({ ok: true, data: order })
        mocks.api.myAgentosAiKnowledgeReadiness.mockResolvedValue({ ok: true, data: { provider: "OpenRouter", chatModel: "deepseek/deepseek-chat", embeddingProfile: "nivo", embeddingDimension: 1024, credentialStatus: "configured", credentialMaskedHint: "or-…", qdrantHealth: "healthy", readinessStatus: "ready", aiReady: true, readinessOperationId: null, knowledgeRecoveryOperationId: null, components: [], origins: [{ origin: "nivo", version: "v1", digest: "digest", documentCount: 1, lastUpdatedAt: null }], failureCode: null, testedAt: null } })
        snapshot()
    })

    it("loads a catalogue, submits an order and opens payment", async () => {
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        expect(flow()).toContain('"subject":"agentos.productName"')
        expect(flow()).not.toContain("nivo AI Agent")
        fireEvent.click(screen.getByTestId("request"))
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
        expect(flow()).toContain('"subject":"agentos.productName"')
        expect(mocks.replace).toHaveBeenCalledWith("/en/agentos/orders/order")
    })

    it("keeps the submit action pending while the order request is unsettled", async () => {
        let resolveOrder: ((value: { ok: true, data: typeof order }) => void) | undefined
        mocks.api.orderAgentOs.mockReturnValue(new Promise((resolve) => {
            resolveOrder = resolve
        }))
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
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
        fireEvent.click(screen.getByTestId("status"))
        expect(mocks.push).toHaveBeenCalledWith("/en/agentos")

        cleanup()
        mocks.api.catalogItems.mockResolvedValue({ ok: true, data: [item] })
        mocks.api.orderAgentOs.mockResolvedValue({ ok: false, reason: "order-down" })
        render(<AgentOSProvisioning context={{ mode: "new" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"request"'))
        fireEvent.click(screen.getByTestId("request"))
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
    })

    it("reconciles resume snapshots into missing, payment, accepted, ready and failed phases", async () => {
        snapshot({ orders: [] })
        const missing = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "missing" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
        missing.unmount()

        snapshot({ invoices: [{ id: "invoice", status: "unpaid", catalogOrder: { id: "order" } }] })
        const unpaid = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
        unpaid.unmount()

        snapshot({ orders: [{ ...order, status: "paid" }] })
        const accepted = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"accepted"'))
        expect(flow()).toContain('"action":"agentos.watchFulfillment"')
        expect(flow()).toContain('"disabled":true')
        accepted.unmount()

        snapshot({ orders: [{ ...order, status: "paid" }], workspaces: [{ id: "workspace", status: "active", name: "Ready workspace", catalogOrder: { id: "order" } }] })
        const ready = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        ready.unmount()

        snapshot({ orders: [{ ...order, status: "paid" }], workspaces: [{ id: "workspace", status: "failed", catalogOrder: { id: "order" } }] })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
    })

    it("turns workspace realtime events into ready and failed states", async () => {
        snapshot({ orders: [{ ...order, status: "paid" }], workspaces: [{ id: "workspace", status: "pending", catalogOrder: { id: "order" } }] })
        const view = render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"preparing"'))
        mocks.realtime = { status: "event", event: { kind: "workspace", id: "workspace", status: "active" } }
        view.rerender(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        mocks.realtime = { status: "event", event: { kind: "workspace", id: "workspace", status: "failed", reason: "broken" } }
        view.rerender(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"failed"'))
    })

    it("routes payment and ready status actions", async () => {
        snapshot({ orders: [{ ...order, status: "pending_payment" }], invoices: [{ id: "invoice", status: "unpaid", catalogOrder: { id: "order" } }] })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"awaiting_payment"'))
        fireEvent.click(screen.getByTestId("status"))
        expect(mocks.push).toHaveBeenCalledWith("/en/wallet?orderId=order&invoiceId=invoice&returnTo=%2Fen%2Fagentos%2Forders%2Forder")

        cleanup()
        snapshot({ orders: [{ ...order, status: "paid" }], workspaces: [{ id: "workspace", status: "active", catalogOrder: { id: "order" } }] })
        render(<AgentOSProvisioning context={{ mode: "resume", orderId: "order" }} />)
        await waitFor(() => expect(flow()).toContain('"state":"ready"'))
        fireEvent.click(screen.getByTestId("status"))
        expect(mocks.push).toHaveBeenCalledWith("/en/agentos/workspaces/workspace")
    })
})
