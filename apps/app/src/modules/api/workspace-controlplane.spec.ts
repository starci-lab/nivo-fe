import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
    cancelWorkspaceProvisioningSaga,
    chatbotWorkbench,
    createWorkspacePurchasePayLink,
    listWorkspacePurchaseOffers,
    payWorkspacePurchaseInvoice,
    readWorkspacePurchaseStatus,
    reconcileChatbotDelivery,
    resolvePurchasedWorkspaceEntry,
    retryWorkspaceProvisioningSaga,
    startWorkspaceCheckout,
    workspaceControlplaneTesting,
    workspaceProvisioningSaga,
} from "./workspace-controlplane"

const jsonResponse = (payload: unknown) => ({ ok: true, status: 200, json: async () => payload })

const api = vi.hoisted(() => ({
    orderAgentOs: vi.fn(),
    myCatalogOrders: vi.fn(),
    myInvoices: vi.fn(),
    myAgentWorkspace: vi.fn(),
    catalogItems: vi.fn(),
    payInvoice: vi.fn(),
    createWalletTopUpPayLink: vi.fn(),
    issueAgentWorkspaceAppLaunch: vi.fn(),
}))

const order = (id: string, status = "pending_payment") => ({
    id,
    status,
    catalogItem: { id: "item-1", name: "Nivo Operations Workspace" },
    catalogTier: { id: "tier-1", name: "Team" },
})
const load = () => import("./workspace-controlplane")
const envelope = (field: string, data: unknown) => jsonResponse({ data: { [field]: { data, success: true, message: "ok", error: null } } })
const refusal = (field: string, error: string) => jsonResponse({ data: { [field]: { data: null, success: false, message: "refused", error } } })
const requestBody = (fetchMock: ReturnType<typeof vi.fn>, call: number) => JSON.parse(String(fetchMock.mock.calls[call]?.[1]?.body)) as { query: string; variables: Record<string, never> & { input?: Record<string, unknown> } }

const orderRow = { id: "order-1", status: "pending_payment", catalogItem: { id: "item-1", name: "AgentOS Workspace" }, catalogTier: { id: "tier-1", name: "Solo" } }
const invoiceRow = { id: "inv-1", amountVnd: 99000, status: "unpaid", dueAt: "2026-01-01T00:00:00.000Z", paidAt: null, catalogOrder: { id: "order-1", catalogItem: { id: "item-1", name: "AgentOS Workspace" }, catalogTier: { id: "tier-1", name: "Solo" } } }
const workspaceRow = { id: "ws-1", name: "studio", status: "provisioning", catalogOrder: { id: "order-1" } }
const sagaRow = { id: "saga-1", jobId: "job-1", definitionKey: "agent-workspace", definitionVersion: 1, resourceKind: "agent_workspace", resourceId: "ws-1", ownerId: "owner-1", status: "running_forward", direction: "forward", forwardCursor: 2, compensationCursor: null, sequence: 7, failureCode: null, failureReason: null, finishedAt: null, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:01:00.000Z" }
const sagaStep = { id: "step-1", stepKey: "create-pod", ordinal: 1, isCompensable: true, forwardStatus: "completed", compensationStatus: "pending", lastError: null, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:30.000Z" }

describe("modules/api/workspace-controlplane", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("routes Chatbot reads and reconciliation through Core without trusting the workspace hostname", async () => {
        const workspaceId = "f9ad3fac-34b3-4a82-a5f4-dc62782bc472"
        const fetchMock = vi.fn()
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: { chatbotWorkspaceWorkbench: { data: { chatbotWorkbench: { installationId: "chatbot-2", lifecycleState: "active", approvedVersion: 4, channels: [], conversations: [], messages: [] } } } } }) })
            .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: { chatbotWorkspaceCommand: { data: { reconcileChatbotDelivery: { id: "receipt-1", installationId: "chatbot-2", state: "recorded" } } } } }) })
        vi.stubGlobal("fetch", fetchMock)

        await chatbotWorkbench("attacker.invalid", workspaceId, "memory-token", "chatbot-2")
        await reconcileChatbotDelivery("attacker.invalid", workspaceId, "memory-token", { installationId: "chatbot-2", providerOutboxId: "outbox-1", outcome: "failed", requestToken: "request-1" })

        const readBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { query: string; variables: unknown }
        const mutationBody = JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body)) as { query: string; variables: { request: { installationId: string; operation: string; input: { outboxId: string; terminalState: string; evidenceRef: string } } } }
        expect(fetchMock.mock.calls[0]?.[0]).toBe("http://localhost:3068/graphql")
        expect(fetchMock.mock.calls[1]?.[0]).toBe("http://localhost:3068/graphql")
        expect(readBody.query).toContain("chatbotWorkspaceWorkbench(request: $request)")
        expect(readBody.variables).toEqual({ request: { workspaceId, installationId: "chatbot-2" } })
        expect(mutationBody.query).toContain("chatbotWorkspaceCommand(request: $request)")
        expect(mutationBody.variables.request).toMatchObject({ installationId: "chatbot-2", operation: "reconcile-delivery", input: { outboxId: "outbox-1", terminalState: "failed", evidenceRef: "operator://manual-reconciliation/outbox-1" } })
        expect(workspaceControlplaneTesting.chatbotCoreEndpoint(workspaceId)).toBe("http://localhost:3068/graphql")
    })
})

describe("listWorkspacePurchaseOffers", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("lists the current offers through the catalog capability", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("catalogItems", [{ id: "item-1", slug: "agentos-workspace", name: "AgentOS Workspace", tagline: null, templateKey: "agentos", tiers: [] }]))
        vi.stubGlobal("fetch", fetchMock)

        const result = await listWorkspacePurchaseOffers("ai_agent")

        expect(result).toEqual({ ok: true, data: [{ id: "item-1", slug: "agentos-workspace", name: "AgentOS Workspace", tagline: null, templateKey: "agentos", tiers: [] }] })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("catalogItems(category: $category)")
        expect(body.variables).toEqual({ category: "ai_agent" })
    })
})

describe("startWorkspaceCheckout", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("admits one checkout and returns the order row as the stable purchase identity", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("orderCatalogItem", orderRow))
        vi.stubGlobal("fetch", fetchMock)

        const result = await startWorkspaceCheckout("agentos-workspace", "tier-1")

        expect(result).toEqual({ ok: true, data: { purchaseId: "order-1", status: "pending_payment", offer: { id: "item-1", name: "AgentOS Workspace" }, tier: { id: "tier-1", name: "Solo" } } })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("orderCatalogItem(input: $input)")
        expect(body.variables.input).toEqual({ catalogItemSlug: "agentos-workspace", catalogTierId: "tier-1" })
    })

    it("propagates a refused checkout without inventing a purchase identity", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(refusal("orderCatalogItem", "ORDER_REFUSED"))
        vi.stubGlobal("fetch", fetchMock)

        const result = await startWorkspaceCheckout("agentos-workspace")

        expect(result).toEqual({ ok: false, reason: "refused", code: "ORDER_REFUSED" })
        const body = requestBody(fetchMock, 0)
        expect(body.variables.input).toEqual({ catalogItemSlug: "agentos-workspace" })
    })

    // The admission lock is its own module registry: the console transport is mocked so the
    // in-flight/recent-repeat behaviour is exercised without a fetch stub.
    describe("double-submit safety", () => {
        beforeEach(() => {
            vi.resetModules()
            vi.doMock("@/modules/api/console", () => api)
            vi.clearAllMocks()
            api.myCatalogOrders.mockResolvedValue({ ok: true, data: [order("purchase-1")] })
            api.myInvoices.mockResolvedValue({ ok: true, data: [] })
            api.myAgentWorkspace.mockResolvedValue({ ok: true, data: [] })
        })
        afterEach(() => { vi.doUnmock("@/modules/api/console") })

        it("joins an identical repeat while the first admission is still in flight", async () => {
            const { startWorkspaceCheckout } = await load()
            let release: (value: unknown) => void = () => undefined
            api.orderAgentOs.mockImplementation(() => new Promise(resolve => { release = resolve }))
            const first = startWorkspaceCheckout("agent-os", "tier-1")
            const second = startWorkspaceCheckout("agent-os", "tier-1")
            release({ ok: true, data: order("purchase-1") })
            const [a, b] = await Promise.all([first, second])
            expect(api.orderAgentOs).toHaveBeenCalledTimes(1)
            expect(a.ok && a.data.purchaseId).toBe("purchase-1")
            expect(b.ok && b.data.purchaseId).toBe("purchase-1")
        })

        it("keeps a different offer or tier as its own purchase", async () => {
            const { startWorkspaceCheckout } = await load()
            api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
            await Promise.all([
                startWorkspaceCheckout("agent-os", "tier-1"),
                startWorkspaceCheckout("agent-os", "tier-2"),
                startWorkspaceCheckout("other-offer", "tier-1"),
            ])
            expect(api.orderAgentOs).toHaveBeenCalledTimes(3)
        })

        it("resolves a recent repeat to the same purchase after re-reading its status", async () => {
            const { startWorkspaceCheckout } = await load()
            api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
            const first = await startWorkspaceCheckout("agent-os", "tier-1")
            const second = await startWorkspaceCheckout("agent-os", "tier-1")
            expect(api.orderAgentOs).toHaveBeenCalledTimes(1)
            expect(api.myCatalogOrders).toHaveBeenCalled()
            expect(second.ok && second.data.purchaseId).toBe(first.ok ? first.data.purchaseId : "")
        })

        it("admits a fresh purchase when the recorded one is terminal", async () => {
            const { startWorkspaceCheckout } = await load()
            api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
            await startWorkspaceCheckout("agent-os", "tier-1")
            api.myCatalogOrders.mockResolvedValue({ ok: true, data: [order("purchase-1", "cancelled")] })
            api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-2") })
            const again = await startWorkspaceCheckout("agent-os", "tier-1")
            expect(api.orderAgentOs).toHaveBeenCalledTimes(2)
            expect(again.ok && again.data.purchaseId).toBe("purchase-2")
        })

        it("admits a fresh purchase when the recorded one is no longer visible", async () => {
            const { startWorkspaceCheckout } = await load()
            api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
            await startWorkspaceCheckout("agent-os", "tier-1")
            api.myCatalogOrders.mockResolvedValue({ ok: true, data: [] })
            api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-2") })
            const again = await startWorkspaceCheckout("agent-os", "tier-1")
            expect(api.orderAgentOs).toHaveBeenCalledTimes(2)
            expect(again.ok && again.data.purchaseId).toBe("purchase-2")
        })

        it("refuses rather than create blindly when the prior purchase cannot be verified", async () => {
            const { startWorkspaceCheckout } = await load()
            api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
            await startWorkspaceCheckout("agent-os", "tier-1")
            api.myCatalogOrders.mockResolvedValue({ ok: false, reason: "orders refused", code: "ORDERS_REFUSED" })
            api.myInvoices.mockResolvedValue({ ok: false, reason: "invoices refused" })
            api.myAgentWorkspace.mockResolvedValue({ ok: false, reason: "workspaces refused" })
            const again = await startWorkspaceCheckout("agent-os", "tier-1")
            expect(again.ok).toBe(false)
            expect(api.orderAgentOs).toHaveBeenCalledTimes(1)
        })

        it("never stores a refused admission for reuse", async () => {
            const { startWorkspaceCheckout } = await load()
            api.orderAgentOs.mockResolvedValue({ ok: false, reason: "order mutation failed" })
            const first = await startWorkspaceCheckout("agent-os", "tier-1")
            expect(first.ok).toBe(false)
            api.orderAgentOs.mockResolvedValue({ ok: true, data: order("purchase-1") })
            const second = await startWorkspaceCheckout("agent-os", "tier-1")
            expect(api.orderAgentOs).toHaveBeenCalledTimes(2)
            expect(second.ok && second.data.purchaseId).toBe("purchase-1")
        })
    })
})

describe("readWorkspacePurchaseStatus", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("assembles source-qualified status from the order, invoice and workspace reads", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(envelope("myCatalogOrders", [orderRow]))
            .mockResolvedValueOnce(envelope("myInvoices", [{ ...invoiceRow, status: "paid", paidAt: "2026-01-01T00:10:00.000Z" }]))
            .mockResolvedValueOnce(envelope("myAgentWorkspace", [workspaceRow]))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspacePurchaseStatus("order-1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.purchaseId).toBe("order-1")
        expect(result.data.order).toEqual({ state: "observed", status: "pending_payment", offerName: "AgentOS Workspace", tierName: "Solo" })
        expect(result.data.payment).toEqual({ state: "observed", invoiceId: "inv-1", status: "paid", amountVnd: 99000, paidAt: "2026-01-01T00:10:00.000Z" })
        expect(result.data.provisioning).toEqual({ state: "observed", workspaceId: "ws-1", workspaceName: "studio", workspaceStatus: "provisioning" })
        expect(requestBody(fetchMock, 0).query).toContain("myCatalogOrders")
        expect(requestBody(fetchMock, 1).query).toContain("myInvoices")
        expect(requestBody(fetchMock, 2).query).toContain("myAgentWorkspace")
    })

    it("keeps an unknown purchase non-disclosing rather than reporting any state", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(envelope("myCatalogOrders", [orderRow]))
            .mockResolvedValueOnce(envelope("myInvoices", [invoiceRow]))
            .mockResolvedValueOnce(envelope("myAgentWorkspace", [workspaceRow]))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspacePurchaseStatus("order-9")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.order).toEqual({ state: "missing" })
        expect(result.data.payment).toEqual({ state: "not-raised" })
        expect(result.data.provisioning).toEqual({ state: "not-admitted" })
    })

    it("marks a refused source unavailable beside the facts the others confirmed", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(envelope("myCatalogOrders", [orderRow]))
            .mockResolvedValueOnce(refusal("myInvoices", "INVOICE_READ_REFUSED"))
            .mockResolvedValueOnce(envelope("myAgentWorkspace", [workspaceRow]))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspacePurchaseStatus("order-1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.order).toMatchObject({ state: "observed" })
        expect(result.data.payment).toEqual({ state: "unavailable", code: "INVOICE_READ_REFUSED" })
        expect(result.data.provisioning).toMatchObject({ state: "observed" })
    })

    it("fails closed when no source answered", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(refusal("myCatalogOrders", "AUTH"))
            .mockResolvedValueOnce(refusal("myInvoices", "AUTH"))
            .mockResolvedValueOnce(refusal("myAgentWorkspace", "AUTH"))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspacePurchaseStatus("order-1")

        expect(result).toEqual({ ok: false, reason: "refused", code: "AUTH" })
    })
})

describe("workspaceProvisioningSaga", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("reads, retries and cancels a provisioning saga by its stable identity", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(envelope("myProvisioningSaga", { saga: sagaRow, steps: [sagaStep] }))
            .mockResolvedValueOnce(envelope("retryProvisioningSaga", { ...sagaRow, status: "queued" }))
            .mockResolvedValueOnce(envelope("cancelProvisioningSaga", { ...sagaRow, status: "compensating" }))
        vi.stubGlobal("fetch", fetchMock)

        const view = await workspaceProvisioningSaga("saga-1")
        const retried = await retryWorkspaceProvisioningSaga("saga-1")
        const cancelled = await cancelWorkspaceProvisioningSaga("saga-1")

        expect(view).toEqual({ ok: true, data: { saga: sagaRow, steps: [sagaStep] } })
        expect(retried).toMatchObject({ ok: true, data: { id: "saga-1", status: "queued" } })
        expect(cancelled).toMatchObject({ ok: true, data: { id: "saga-1", status: "compensating" } })
        expect(requestBody(fetchMock, 0).query).toContain("myProvisioningSaga(input: $input)")
        expect(requestBody(fetchMock, 0).variables.input).toEqual({ sagaId: "saga-1" })
        expect(requestBody(fetchMock, 1).query).toContain("retryProvisioningSaga(input: $input)")
        expect(requestBody(fetchMock, 1).variables.input).toEqual({ sagaId: "saga-1" })
        expect(requestBody(fetchMock, 2).query).toContain("cancelProvisioningSaga(input: $input)")
        expect(requestBody(fetchMock, 2).variables.input).toEqual({ sagaId: "saga-1" })
    })
})

describe("payWorkspacePurchaseInvoice", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("settles the purchase invoice through the billing mutation", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("payInvoice", { ...invoiceRow, status: "paid" }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await payWorkspacePurchaseInvoice("inv-1")

        expect(result).toMatchObject({ ok: true, data: { id: "inv-1", status: "paid" } })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("payInvoice(input: $input)")
        expect(body.variables.input).toEqual({ invoiceId: "inv-1" })
    })
})

describe("createWorkspacePurchasePayLink", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("raises the provider payment action without claiming settlement", async () => {
        const payLink = { paymentId: "pay-1", gateway: "sepay", referenceId: "ref-1", checkoutUrl: "https://pay.example/checkout", qrCode: null, checkoutFields: null, amountVnd: 99000, chargedAmountVnd: 99000 }
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("createWalletTopUpPayLink", payLink))
        vi.stubGlobal("fetch", fetchMock)

        const result = await createWorkspacePurchasePayLink({ amountVnd: 99000, returnUrl: "https://app.example/return", cancelUrl: "https://app.example/cancel" })

        expect(result).toEqual({ ok: true, data: payLink })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("createWalletTopUpPayLink(input: $input)")
        expect(body.variables.input).toEqual({ amountVnd: 99000, gateway: "sepay", returnUrl: "https://app.example/return", cancelUrl: "https://app.example/cancel" })
    })
})

describe("resolvePurchasedWorkspaceEntry", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("resolves workspace entry through the issued launch grant", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("issueAgentWorkspaceAppLaunch", { launchId: "launch-1", redirectUrl: "https://pod.example/launch", expiresAt: "2026-01-01T01:00:00.000Z" }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await resolvePurchasedWorkspaceEntry("ws-1")

        expect(result).toEqual({ ok: true, data: { launchId: "launch-1", redirectUrl: "https://pod.example/launch", expiresAt: "2026-01-01T01:00:00.000Z" } })
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("issueAgentWorkspaceAppLaunch(input: $input)")
        expect(body.variables.input).toEqual({ workspaceId: "ws-1", app: "Openclaw" })
    })
})