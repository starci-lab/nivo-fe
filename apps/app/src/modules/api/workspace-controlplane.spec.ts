import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
    cancelWorkspaceProvisioningSaga,
    chatbotWorkbench,
    createWorkspacePurchasePayLink,
    listWorkspacePurchaseOffers,
    payWorkspacePurchaseInvoice,
    readWorkspaceCheckoutOffers,
    readWorkspaceCheckoutStatus,
    readWorkspacePurchaseStatus,
    reconcileChatbotDelivery,
    recoverWorkspacePurchase,
    resolvePurchasedWorkspaceEntry,
    resolveWorkspaceCheckoutEntry,
    retryWorkspaceProvisioningSaga,
    startWorkspaceCheckout,
    startWorkspaceCheckoutPurchase,
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

// The workspace-checkout boundary is reached through the same `<field>(request: $request)` shape the
// rest of the transport uses, so these specs read the `request` variable rather than `input`.
const requestVariables = (fetchMock: ReturnType<typeof vi.fn>, call: number) => requestBody(fetchMock, call).variables as unknown as { request: Record<string, unknown> }

const checkoutOffer = { offerId: "offer-team", offerVersion: "v1", displayName: "Team Workspace", includedOutcome: "One ready agent workspace", amount: "499000", currency: "VND", billingCadence: "monthly", renewalMode: "explicit-reauthorization", eligibility: "market:VN" }
const checkoutStatus = {
    purchaseId: "purchase-1",
    state: "paid",
    offer: checkoutOffer,
    payment: { source: "payment-reconciliation", state: "verified-success", reference: "attempt-1", observedAt: "2026-01-01T00:09:00.000Z" },
    billing: { source: "platform-billing-ledger", state: "settled", reference: "receipt-1", observedAt: "2026-01-01T00:10:00.000Z" },
    provisioning: { source: "workspace-provisioning", state: "admitted", reference: "order-1", observedAt: "2026-01-01T00:11:00.000Z", disposition: "provisioning", reason: null },
    readiness: { source: "workspace-provisioning", state: "pending", reference: null, observedAt: "2026-01-01T00:11:00.000Z" },
    serviceEligibility: { source: "workspace-provisioning", state: "none", reference: null, observedAt: null, reason: null, heldSince: null, paidThrough: null, renewalEvidence: "none", renewalAction: null },
    ledger: {
        source: "platform-billing-ledger",
        state: "observed",
        ledgerState: "settled",
        observedAt: "2026-01-01T00:10:00.000Z",
        entries: [{ entryId: "entry-1", purchaseId: "purchase-1", billingReceiptId: "receipt-1", kind: "charge", amount: "499000", currency: "VND", linkedEntryId: null, observationId: "obs-1", actorPrincipal: null, reason: null, paymentRail: "vnpay", providerTransactionRef: "vnpay-tx-1", accountingCopyState: "pending", postedAt: "2026-01-01T00:10:00.000Z" }],
    },
    refund: null,
    refundStatus: null,
    lastConfirmedAt: "2026-01-01T00:11:00.000Z",
}

describe("readWorkspaceCheckoutOffers", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("selects the exact offer version and answers the current approved offers", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspaceCheckoutOffers", { status: "offers", offers: [checkoutOffer], selection: { offerId: "offer-team", offerVersion: "v1", state: "current" } }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutOffers("offer-team", "v1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("offers")
        expect(result.data.status === "offers" && result.data.offers).toEqual([checkoutOffer])
        expect(result.data.status === "offers" && result.data.selection.state).toBe("current")
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspaceCheckoutOffers(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({ offerId: "offer-team", offerVersion: "v1" })
    })

    it("keeps a stale selection verdict and the approved list in the same answer", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspaceCheckoutOffers", { status: "offers", offers: [checkoutOffer], selection: { offerId: "offer-team", offerVersion: "v0", state: "stale" } }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutOffers("offer-team", "v0")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status === "offers" && result.data.selection.state).toBe("stale")
        expect(result.data.status === "offers" && result.data.offers).toHaveLength(1)
    })

    it("carries an admission refusal with the verified-Login door it points at", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspaceCheckoutOffers", { status: "refused", code: "purchaser-not-admitted", nextAction: "login-verify-email", offers: [checkoutOffer] }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutOffers("offer-team", "v1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("refused")
        expect(result.data.status === "refused" && result.data.code).toBe("purchaser-not-admitted")
        expect(result.data.status === "refused" && result.data.nextAction).toBe("login-verify-email")
        expect(result.data.status === "refused" && result.data.offers).toHaveLength(1)
    })
})

describe("startWorkspaceCheckoutPurchase", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("admits the purchase under its retry key on the chosen rail and returns the provider action", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspaceCheckoutStart", { status: "prepared", purchaseId: "purchase-1", purchase: checkoutStatus, paymentAction: { paymentAttemptId: "attempt-1", provider: "vnpay", kind: "redirect", payload: { url: "https://sandbox.vnpayment.example/pay" } } }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await startWorkspaceCheckoutPurchase({ retryKey: "start-purchase-1", offerId: "offer-team", offerVersion: "v1", paymentRail: "vnpay" })

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("prepared")
        expect(result.data.status === "prepared" && result.data.paymentAction?.provider).toBe("vnpay")
        expect(result.data.status === "prepared" && result.data.purchase.state).toBe("paid")
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspaceCheckoutStart(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({ retryKey: "start-purchase-1", offerId: "offer-team", offerVersion: "v1", paymentRail: "vnpay" })
    })

    it("carries the existing entitlement when the purchase is an explicit renewal", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspaceCheckoutStart", { status: "prepared", purchaseId: "purchase-2", purchase: { ...checkoutStatus, purchaseId: "purchase-2" }, paymentAction: null }))
        vi.stubGlobal("fetch", fetchMock)

        await startWorkspaceCheckoutPurchase({ retryKey: "renew-1", offerId: "offer-team", offerVersion: "v1", paymentRail: "momo", renewalEntitlementId: "entitlement-1" })

        expect(requestVariables(fetchMock, 0).request).toEqual({ retryKey: "renew-1", offerId: "offer-team", offerVersion: "v1", paymentRail: "momo", renewalEntitlementId: "entitlement-1" })
    })

    it("reports a refused admission as a refusal and never as a prepared purchase", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(refusal("workspaceCheckoutStart", "PURCHASER_NOT_ADMITTED"))
        vi.stubGlobal("fetch", fetchMock)

        const result = await startWorkspaceCheckoutPurchase({ retryKey: "start-purchase-1", offerId: "offer-team", offerVersion: "v1", paymentRail: "vnpay" })

        expect(result).toEqual({ ok: false, reason: "refused", code: "PURCHASER_NOT_ADMITTED" })
    })
})

describe("readWorkspaceCheckoutStatus", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("reads each facet from its owning source and never promotes settlement into readiness", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspacePurchaseStatus", { status: "status", purchaseId: "purchase-1", purchase: checkoutStatus }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutStatus("purchase-1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status === "status" && result.data.purchase.billing.source).toBe("platform-billing-ledger")
        expect(result.data.status === "status" && result.data.purchase.provisioning.disposition).toBe("provisioning")
        expect(result.data.status === "status" && result.data.purchase.readiness.state).toBe("pending")
        expect(result.data.status === "status" && result.data.purchase.serviceEligibility?.renewalEvidence).toBe("none")
        expect(result.data.status === "status" && result.data.purchase.ledger?.entries[0]?.paymentRail).toBe("vnpay")
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspacePurchaseStatus(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({ purchaseId: "purchase-1" })
    })

    it("keeps an unavailable source an unavailable facet rather than a terminal claim", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspacePurchaseStatus", { status: "unavailable", code: "source-unavailable", source: "platform-billing-ledger", purchaseId: "purchase-1" }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutStatus("purchase-1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("unavailable")
        expect(result.data.status === "unavailable" && result.data.source).toBe("platform-billing-ledger")
    })
})

describe("recoverWorkspacePurchase", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("reconciles through the identities the caller observed", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspacePurchaseRecover", { status: "status", purchaseId: "purchase-1", purchase: checkoutStatus }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await recoverWorkspacePurchase({ purchaseId: "purchase-1", lastObserved: { paymentAttemptId: "attempt-1", providerReference: "vnpay-tx-1" } })

        expect(result.ok).toBe(true)
        expect(result.ok && result.data.status).toBe("status")
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspacePurchaseRecover(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({ purchaseId: "purchase-1", lastObserved: { paymentAttemptId: "attempt-1", providerReference: "vnpay-tx-1" } })
    })

    it("sends no last-observed identities when the caller observed none", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspacePurchaseRecover", { status: "status", purchaseId: "purchase-1", purchase: checkoutStatus }))
        vi.stubGlobal("fetch", fetchMock)

        await recoverWorkspacePurchase({ purchaseId: "purchase-1" })

        expect(requestVariables(fetchMock, 0).request).toEqual({ purchaseId: "purchase-1" })
    })

    it("surfaces a conflicting reuse as a closed conflict answer", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspacePurchaseRecover", { status: "conflict", code: "observed-identity-mismatch", purchaseId: "purchase-1" }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await recoverWorkspacePurchase({ purchaseId: "purchase-1", lastObserved: { paymentAttemptId: "attempt-stale" } })

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("conflict")
        expect(result.data.status === "conflict" && result.data.code).toBe("observed-identity-mismatch")
    })
})

// The caller claims only the purchase it owns and the workspace it says is ready; the backend derives
// the readiness observation from its own confirmed record, so the wire request carries no readiness identity.
describe("resolveWorkspaceCheckoutEntry", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("returns the registered destination for the exact readiness-confirmed workspace", async () => {
        const destination = { workspaceId: "ws-1", ownerId: "owner-1", routeName: "workspace-dashboard", routeVersion: "1", context: { tab: "overview" } }
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspacePurchaseEntry", { status: "entry", purchaseId: "purchase-1", workspaceId: "ws-1", destination }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await resolveWorkspaceCheckoutEntry({ purchaseId: "purchase-1", workspaceId: "ws-1", returnContext: { name: "workspace-dashboard", version: "1" } })

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status === "entry" && result.data.destination).toEqual(destination)
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspacePurchaseEntry(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({ purchaseId: "purchase-1", workspaceId: "ws-1", returnContext: { name: "workspace-dashboard", version: "1" } })
    })

    it("returns the composed status instead of a destination while readiness is unconfirmed", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(envelope("workspacePurchaseEntry", { status: "not-ready", purchaseId: "purchase-1", purchase: checkoutStatus }))
        vi.stubGlobal("fetch", fetchMock)

        const result = await resolveWorkspaceCheckoutEntry({ purchaseId: "purchase-1", workspaceId: "ws-1" })

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("not-ready")
        expect(result.data.status === "not-ready" && result.data.purchase.readiness.state).toBe("pending")
    })
})