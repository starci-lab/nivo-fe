import {
    catalogItems,
    createWalletTopUpPayLink,
    myCatalogOrders,
    myInvoices,
    orderAgentOs,
    payInvoice,
    type CatalogCategory,
    type CatalogOrderStatus,
    type InvoiceRow,
} from "../commerce"
import { graphql } from "../graphql"
import {
    issueAgentWorkspaceAppLaunch,
    myAgentWorkspace,
    type AgentWorkspaceRow,
} from "../agentos-workspaces"
import { failed, failureKindOfCode, type Outcome } from "../outcome"
import type {
    PurchasedWorkspaceEntry,
    WorkspacePurchaseOffer,
    WorkspacePurchasePayLink,
    WorkspacePurchasePayLinkInput,
    WorkspacePurchaseReceipt,
    WorkspacePurchaseStatus,
    WorkspaceProvisioningSaga,
    WorkspaceProvisioningSagaView,
} from "./purchase-types"
const WORKSPACE_PROVISIONING_SAGA =
    "{ id jobId definitionKey definitionVersion resourceKind resourceId ownerId status direction forwardCursor compensationCursor sequence failureCode failureReason finishedAt createdAt updatedAt }"

/** The fields one saga step carries. */
const WORKSPACE_PROVISIONING_SAGA_STEP =
    "{ id stepKey ordinal isCompensable forwardStatus compensationStatus lastError createdAt updatedAt }"

/**
 * List the workspace offers a purchaser may select (contract operation `select-offer`).
 *
 * @param category - Which catalogue slice publishes the workspace offers.
 * @returns The offers, or why there are none.
 */
export const listWorkspacePurchaseOffers = (
    category: CatalogCategory,
): Promise<Outcome<ReadonlyArray<WorkspacePurchaseOffer>>> => catalogItems(category)

/**
 * Order statuses whose purchase is still the same admitted checkout. A repeat inside the reuse
 * window resolves to that receipt rather than a second purchase; `cancelled` and `suspended` are
 * absent on purpose - a terminal purchase admits a fresh checkout.
 */
const REUSABLE_ORDER_STATUSES: ReadonlySet<CatalogOrderStatus> = new Set([
    "active",
    "completed",
    "in_progress",
    "pending_payment",
])

/** How long an exact repeat of one admitted checkout resolves to the receipt it already earned. */
const CHECKOUT_RECEIPT_TTL_MS = 10 * 60 * 1000

/** Checkouts still in flight, keyed by their canonical request meaning: offer slug plus rung. */
const checkoutInFlight = new Map<string, Promise<Outcome<WorkspacePurchaseReceipt>>>()

/** Receipts recent checkouts earned; a repeat re-reads the purchase before it may reuse one. */
const checkoutReceipts = new Map<string, { readonly at: number; readonly receipt: WorkspacePurchaseReceipt }>()

const admitWorkspaceCheckout = async (
    offerSlug: string,
    tierId?: string,
): Promise<Outcome<WorkspacePurchaseReceipt>> => {
    const order = await orderAgentOs(offerSlug, tierId)
    if (!order.ok) return order
    return {
        ok: true,
        data: {
            purchaseId: order.data.id,
            status: order.data.status,
            offer: order.data.catalogItem,
            tier: order.data.catalogTier,
        },
    }
}

/**
 * Admit one purchase of a selected offer (contract operation `start-checkout`).
 *
 * THE ORDER ROW THE BACKEND RETURNS IS THE PURCHASE: its id is the stable purchase identity and an
 * exact repeat of the same admitted checkout returns the same row rather than a second purchase.
 * No payment is claimed by this call - paying is a separate, explicitly reconciled action.
 *
 * DOUBLE-SUBMIT SAFETY IS BOUNDED, NOT INFINITE. A repeat while the first request is in flight
 * joins that request, and a repeat inside the reuse window resolves to the recorded receipt only
 * after re-reading the purchase and finding it still standing - a terminal purchase admits a
 * fresh checkout and an unverifiable one refuses rather than creating a blind second charge. A
 * repeat from another tab or device cannot be deduplicated here; the canonical order mutation
 * accepts no caller idempotency key, so only the backend can make cross-session repeats safe.
 *
 * @param offerSlug - The selected offer's address fragment.
 * @param tierId - The selected rung, when the offer is tiered.
 * @returns The admitted purchase, or why checkout was refused.
 */
export const startWorkspaceCheckout = async (
    offerSlug: string,
    tierId?: string,
): Promise<Outcome<WorkspacePurchaseReceipt>> => {
    const checkoutKey = `${offerSlug}:${tierId ?? ""}`
    const recorded = checkoutReceipts.get(checkoutKey)
    if (recorded !== undefined && Date.now() - recorded.at < CHECKOUT_RECEIPT_TTL_MS) {
        const status = await readWorkspacePurchaseStatus(recorded.receipt.purchaseId)
        if (!status.ok) return status
        if (status.data.order.state === "observed") {
            if (REUSABLE_ORDER_STATUSES.has(status.data.order.status)) return { ok: true, data: recorded.receipt }
            checkoutReceipts.delete(checkoutKey)
        } else if (status.data.order.state === "missing") {
            checkoutReceipts.delete(checkoutKey)
        } else {
            const code = status.data.order.code ?? "purchase-source-unavailable"
            return failed(failureKindOfCode(code), {
                code,
                reason: status.data.order.code ?? "purchase source unavailable",
            })
        }
    }
    const pending = checkoutInFlight.get(checkoutKey)
    if (pending !== undefined) return pending
    const admitted = admitWorkspaceCheckout(offerSlug, tierId)
    checkoutInFlight.set(checkoutKey, admitted)
    try {
        const result = await admitted
        if (result.ok) checkoutReceipts.set(checkoutKey, { at: Date.now(), receipt: result.data })
        return result
    } finally {
        checkoutInFlight.delete(checkoutKey)
    }
}

/**
 * Read the source-qualified status of one purchase (contract operation `read-purchase-status`).
 *
 * THREE SOURCES ANSWER INDEPENDENTLY AND EACH KEEPS ITS NAME. The order row, the invoice row and
 * the bound workspace row are read together; a source that refuses is reported as unavailable
 * beside the facts the others confirmed, so a slow billing read can never pass for a paid invoice
 * nor hide an already-bound workspace. When no source answered at all the read fails closed.
 *
 * @param purchaseId - The purchase identity returned by {@link startWorkspaceCheckout}.
 * @returns The status, or why no source could be read.
 */
export const readWorkspacePurchaseStatus = async (purchaseId: string): Promise<Outcome<WorkspacePurchaseStatus>> => {
    const [orders, invoices, workspaces] = await Promise.all([myCatalogOrders(), myInvoices(), myAgentWorkspace()])
    if (!orders.ok && !invoices.ok && !workspaces.ok) return orders
    const order = orders.ok ? orders.data.find((row) => row.id === purchaseId) : undefined
    const invoice = invoices.ok ? invoices.data.find((row) => row.catalogOrder?.id === purchaseId) : undefined
    const workspace = workspaces.ok ? workspaces.data.find((row) => row.catalogOrder?.id === purchaseId) : undefined
    return {
        ok: true,
        data: {
            purchaseId,
            observedAt: new Date().toISOString(),
            order: !orders.ok
                ? {
                      state: "unavailable",
                      code: orders.code ?? null,
                  }
                : order === undefined
                  ? {
                        state: "missing",
                    }
                  : {
                        state: "observed",
                        status: order.status,
                        offerName: order.catalogItem?.name ?? null,
                        tierName: order.catalogTier?.name ?? null,
                    },
            payment: !invoices.ok
                ? {
                      state: "unavailable",
                      code: invoices.code ?? null,
                  }
                : invoice === undefined
                  ? {
                        state: "not-raised",
                    }
                  : {
                        state: "observed",
                        invoiceId: invoice.id,
                        status: invoice.status,
                        amountVnd: invoice.amountVnd,
                        paidAt: invoice.paidAt,
                    },
            provisioning: !workspaces.ok
                ? {
                      state: "unavailable",
                      code: workspaces.code ?? null,
                  }
                : workspace === undefined
                  ? {
                        state: "not-admitted",
                    }
                  : {
                        state: "observed",
                        workspaceId: workspace.id,
                        workspaceName: workspace.name,
                        workspaceStatus: workspace.status,
                    },
        },
    }
}

/**
 * Settle one purchase invoice from wallet balance (a `request-safe-recovery` action).
 *
 * THE BACKEND'S OWN BILLING MUTATION IS THE SAFE RETRY: a refused or already-settled invoice comes
 * back as a refusal carrying the server's sentence, so repeating the action can never double-charge
 * nor claim a payment the ledger did not record.
 *
 * @param invoiceId - The unpaid invoice reported by {@link readWorkspacePurchaseStatus}.
 * @returns The canonical invoice, or why settlement was refused.
 */
export const payWorkspacePurchaseInvoice = (invoiceId: string): Promise<Outcome<InvoiceRow>> => payInvoice(invoiceId)

/**
 * Raise the provider-hosted payment action for one purchase invoice (a `request-safe-recovery`
 * action).
 *
 * THE RETURNED URL IS A PROVIDER ACCEPTANCE PAGE, NOT A RECEIPT: checkout completion must be
 * reconciled through {@link readWorkspacePurchaseStatus}, which only reports paid when the billing
 * ledger recorded it.
 *
 * @param input - The invoice amount and the provider's return/cancel addresses.
 * @returns The hosted checkout details, or why none could be raised.
 */
export const createWorkspacePurchasePayLink = (
    input: WorkspacePurchasePayLinkInput,
): Promise<Outcome<WorkspacePurchasePayLink>> =>
    createWalletTopUpPayLink(input.amountVnd, input.returnUrl, input.cancelUrl)

/**
 * Read the durable provisioning order bound to one purchase (contract operation
 * `read-provisioning`).
 *
 * THE SAGA IS THE RECORD, NOT A PROJECTION: its status, cursor and step rows are persisted truth,
 * so a replayed or stale copy can still be reconciled by `sequence` and `updatedAt`.
 *
 * @param sagaId - The provisioning order identity observed through the realtime stream.
 * @returns The saga and its steps, or why the read was refused.
 */
export const workspaceProvisioningSaga = (sagaId: string): Promise<Outcome<WorkspaceProvisioningSagaView>> =>
    graphql(
        `query WorkspaceProvisioningSaga($input: MyProvisioningSagaInput!) { myProvisioningSaga(request: $input) { data { saga ${WORKSPACE_PROVISIONING_SAGA} steps ${WORKSPACE_PROVISIONING_SAGA_STEP} } message success error } }`,
        {
            input: {
                sagaId,
            },
        },
    )

/**
 * Ask the backend to resume one stalled provisioning order (a `request-safe-recovery` action).
 *
 * SAFE RETRY IS THE SAGA RUNNER'S DECISION: the backend refuses a saga that is not waiting on a
 * retry, so an exact repeat resumes the same durable order and a conflicting request fails closed.
 *
 * @param sagaId - The provisioning order identity.
 * @returns The saga row as it now stands, or why the retry was refused.
 */
export const retryWorkspaceProvisioningSaga = (sagaId: string): Promise<Outcome<WorkspaceProvisioningSaga>> =>
    graphql(
        `mutation RetryWorkspaceProvisioningSaga($input: RetryProvisioningSagaInput!) { retryProvisioningSaga(request: $input) { data ${WORKSPACE_PROVISIONING_SAGA} message success error } }`,
        {
            input: {
                sagaId,
            },
        },
    )

/**
 * Ask the backend to abandon one provisioning order (a `request-safe-recovery` action).
 *
 * @param sagaId - The provisioning order identity.
 * @returns The saga row as it now stands, or why the cancellation was refused.
 */
export const cancelWorkspaceProvisioningSaga = (sagaId: string): Promise<Outcome<WorkspaceProvisioningSaga>> =>
    graphql(
        `mutation CancelWorkspaceProvisioningSaga($input: CancelProvisioningSagaInput!) { cancelProvisioningSaga(request: $input) { data ${WORKSPACE_PROVISIONING_SAGA} message success error } }`,
        {
            input: {
                sagaId,
            },
        },
    )

/**
 * Resolve the entry grant for one owned, ready workspace (contract operation
 * `resolve-purchased-workspace-entry`).
 *
 * THE DESTINATION IS ISSUED, NEVER CHOSEN: the backend returns a single-use launch grant for the
 * exact workspace the caller owns, and an unready or unowned workspace is refused rather than
 * navigated to.
 *
 * @param workspaceId - The bound workspace reported by {@link readWorkspacePurchaseStatus}.
 * @returns The launch grant, or why entry was refused.
 */
export const resolvePurchasedWorkspaceEntry = (workspaceId: string): Promise<Outcome<PurchasedWorkspaceEntry>> =>
    issueAgentWorkspaceAppLaunch(workspaceId)

/**
 * Ask the backend to re-drive provisioning of one failed workspace (the `retry-provisioning-order`
 * action).
 *
 * THE WORKSPACE ROW IS THE FENCED RETRY IDENTITY. `manageAgentWorkspace` admits `retry_provision`
 * only while the bound workspace stands in `failed`, lands it back in `provisioning`, and refuses
 * every other lifecycle position - so a repeat can never admit a second workspace or resurrect a
 * terminal one. The saga-level `retryProvisioningSaga` mutation remains for callers that already
 * hold a saga identity; the purchase-status surface observes only the workspace row, and this is
 * the owner-scoped recovery the backend published for exactly that observation.
 *
 * @param workspaceId - The failed workspace reported by {@link readWorkspacePurchaseStatus}.
 * @returns The workspace row as it now stands, or why the retry was refused.
 */
export const retryWorkspaceProvisioningOrder = (workspaceId: string): Promise<Outcome<AgentWorkspaceRow>> =>
    graphql(
        `
            mutation ManageAgentWorkspace($input: ManageAgentWorkspaceInput!) {
                manageAgentWorkspace(request: $input) {
                    data {
                        id
                        name
                        status
                        catalogOrder {
                            id
                        }
                    }
                    message
                    success
                    error
                }
            }
        `,
        {
            input: {
                agentWorkspaceId: workspaceId,
                action: "retry_provision",
            },
        },
    )

/*
 * ---------------------------------------------------------------------------
 * THE WORKSPACE-CHECKOUT BOUNDARY.
 *
 * EVERY PURCHASE FUNCTION ABOVE IS BOUND TO THE CONSOLE'S GENERIC SURFACE - `catalogItems`, `orderAgentOs`, `myCatalogOrders`, `myInvoices`, `myAgentWorkspace`, `payInvoice`, `createWalletTopUpPayLink` - and that binding is why a purchase screen could only ever describe a generic order: whatever provider name the wallet top-up happened to carry, whatever the invoice row happened to say, and no rail for the purchaser to choose, because the generic order surface has no rail. The workspace-provision feature now publishes its own boundary over the real purchase process (`src/features/workspace-provision/transport/graphql`), and this section binds to it.
 *
 * NOTHING ABOVE IS REMOVED. The chatbot workbench and the console screens that still read the generic surface keep every export they had, so both surfaces are reachable at once and a screen can move one call at a time.
 *
 * THE ANSWER IS A CLOSED OUTCOME, NOT AN ERROR. `offers`, `prepared` and `status` carry payloads; `refused`, `unavailable`, `conflict` and `outcome-unknown` are terminal answers that never claim a paid, provisioning or ready fact - so a caller must read `status` before it reads any fact, and `ok` alone never means the purchase advanced.
 * ---------------------------------------------------------------------------
 */

/** The two owner-approved domestic payment rails a checkout may select; a missing choice never starts an attempt. */
