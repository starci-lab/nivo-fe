import { failed, failureKindOfCode, type Outcome } from "@nivo/api"
import { orderAgentOs } from "../commerce"
import type { CatalogOrderStatus } from "../__generated__/core"
import { readWorkspacePurchaseStatus } from "./purchase-status"
import type { WorkspacePurchaseReceipt } from "./purchase-types"

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
