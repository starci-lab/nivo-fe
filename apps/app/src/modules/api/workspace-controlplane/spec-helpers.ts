import { vi } from "vitest"

/** Minimal successful response shape for transport specs. */
export const jsonResponse = (payload: unknown) => ({ ok: true, status: 200, json: async () => payload })

/** Mock capability functions used to exercise repeated checkout admission. */
export const api = vi.hoisted(() => ({
    orderAgentOs: vi.fn(),
    myCatalogOrders: vi.fn(),
    myInvoices: vi.fn(),
    myAgentWorkspace: vi.fn(),
    catalogItems: vi.fn(),
    payInvoice: vi.fn(),
    createWalletTopUpPayLink: vi.fn(),
    issueAgentWorkspaceAppLaunch: vi.fn(),
}))

/** Builds a catalog order fixture with a selected lifecycle state. */
export const order = (id: string, status = "pending_payment") => ({
    id,
    status,
    catalogItem: { id: "item-1", name: "Nivo Operations Workspace" },
    catalogTier: { id: "tier-1", name: "Team" },
})

/** Loads the public workspace controlplane module after resetting module state. */
export const load = () => import("./index")

/** Wraps a successful field response in the shared GraphQL envelope. */
export const envelope = (field: string, data: unknown) =>
    jsonResponse({ data: { [field]: { data, success: true, message: "ok", error: null } } })

/** Wraps a refused field response in the shared GraphQL envelope. */
export const refusal = (field: string, error: string) =>
    jsonResponse({ data: { [field]: { data: null, success: false, message: "refused", error } } })

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

/** Reads one serialized GraphQL request from a mocked fetch call. */
export const requestBody = (fetchMock: ReturnType<typeof vi.fn>, call: number) => {
    const parsed: unknown = JSON.parse(String(fetchMock.mock.calls[call]?.[1]?.body))
    if (!isRecord(parsed) || typeof parsed.query !== "string" || !isRecord(parsed.variables)) {
        throw new Error("The request body did not match the GraphQL request shape")
    }
    return { query: parsed.query, variables: parsed.variables }
}

/** Purchase order fixture used by purchase and provisioning specs. */
export const orderRow = {
    id: "order-1",
    status: "pending_payment",
    catalogItem: { id: "item-1", name: "AgentOS Workspace" },
    catalogTier: { id: "tier-1", name: "Solo" },
}

/** Invoice fixture used by status and payment specs. */
export const invoiceRow = {
    id: "inv-1",
    amountVnd: 99000,
    status: "unpaid",
    dueAt: "2026-01-01T00:00:00.000Z",
    paidAt: null,
    catalogOrder: {
        id: "order-1",
        catalogItem: { id: "item-1", name: "AgentOS Workspace" },
        catalogTier: { id: "tier-1", name: "Solo" },
    },
}

/** Workspace fixture used by purchase status specs. */
export const workspaceRow = { id: "ws-1", name: "studio", status: "provisioning", catalogOrder: { id: "order-1" } }

/** Provisioning saga fixture used by saga operation specs. */
export const sagaRow = {
    id: "saga-1",
    jobId: "job-1",
    definitionKey: "agent-workspace",
    definitionVersion: 1,
    resourceKind: "agent_workspace",
    resourceId: "ws-1",
    ownerId: "owner-1",
    status: "running_forward",
    direction: "forward",
    forwardCursor: 2,
    compensationCursor: null,
    sequence: 7,
    failureCode: null,
    failureReason: null,
    finishedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:01:00.000Z",
}

/** Provisioning step fixture associated with sagaRow. */
export const sagaStep = {
    id: "step-1",
    stepKey: "create-pod",
    ordinal: 1,
    isCompensable: true,
    forwardStatus: "completed",
    compensationStatus: "pending",
    lastError: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:30.000Z",
}


/** Reads the typed request variables used by workspace checkout operations. */
export const requestVariables = (fetchMock: ReturnType<typeof vi.fn>, call: number) => {
    const request = requestBody(fetchMock, call).variables.request
    if (!isRecord(request)) throw new Error("The workspace checkout request variables were missing")
    return { request }
}

/** Current offer fixture used by checkout specs. */
export const checkoutOffer = {
    offerId: "offer-team",
    offerVersion: "v1",
    displayName: "Team Workspace",
    includedOutcome: "One ready agent workspace",
    amount: "499000",
    currency: "VND",
    billingCadence: "monthly",
    renewalMode: "explicit-reauthorization",
    eligibility: "market:VN",
}

/** Composed status fixture returned by workspace checkout operations. */
export const checkoutStatus = {
    purchaseId: "purchase-1",
    state: "paid",
    offer: checkoutOffer,
    payment: {
        source: "payment-reconciliation",
        state: "verified-success",
        reference: "attempt-1",
        observedAt: "2026-01-01T00:09:00.000Z",
    },
    billing: {
        source: "platform-billing-ledger",
        state: "settled",
        reference: "receipt-1",
        observedAt: "2026-01-01T00:10:00.000Z",
    },
    provisioning: {
        source: "workspace-provisioning",
        state: "admitted",
        reference: "order-1",
        observedAt: "2026-01-01T00:11:00.000Z",
        disposition: "provisioning",
        reason: null,
    },
    readiness: {
        source: "workspace-provisioning",
        state: "pending",
        reference: null,
        observedAt: "2026-01-01T00:11:00.000Z",
    },
    serviceEligibility: {
        source: "workspace-provisioning",
        state: "none",
        reference: null,
        observedAt: null,
        reason: null,
        heldSince: null,
        paidThrough: null,
        renewalEvidence: "none",
        renewalAction: null,
    },
    ledger: {
        source: "platform-billing-ledger",
        state: "observed",
        ledgerState: "settled",
        observedAt: "2026-01-01T00:10:00.000Z",
        entries: [
            {
                entryId: "entry-1",
                purchaseId: "purchase-1",
                billingReceiptId: "receipt-1",
                kind: "charge",
                amount: "499000",
                currency: "VND",
                linkedEntryId: null,
                observationId: "obs-1",
                actorPrincipal: null,
                reason: null,
                paymentRail: "vnpay",
                providerTransactionRef: "vnpay-tx-1",
                accountingCopyState: "pending",
                postedAt: "2026-01-01T00:10:00.000Z",
            },
        ],
    },
    refund: null,
    refundStatus: null,
    lastConfirmedAt: "2026-01-01T00:11:00.000Z",
}
