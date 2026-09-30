
import type { WorkspaceCheckoutPurchaseStatusFieldsFragment } from "@/modules/api/__generated__/core"

/** Every resolved state the purchase-status surface can prove. */
export type PurchasePhase =
    | "loading"
    | "payment-pending"
    | "payment-unknown"
    | "payment-refused"
    | "payment-failed"
    | "payment-cancelled"
    | "paid"
    | "queued"
    | "provisioning"
    | "provisioning-unknown"
    | "provisioning-refused"
    | "provisioning-failed-retryable"
    | "provisioning-failed-terminal"
    | "refund-started"
    | "refunded"
    | "refund-pending-reconciliation"
    | "service-eligibility-hold"
    | "ready"
    | "denied"

/** Phases that draw the payment surface's fact card and verification rail. */
export const PAYMENT_PHASES: ReadonlySet<PurchasePhase> = new Set([
    "payment-pending",
    "payment-unknown",
    "payment-refused",
    "payment-failed",
    "payment-cancelled",
    "paid",
])

/** Phases that draw the provisioning surface's order card and confirmed-facts rail. */
export const PROVISIONING_PHASES: ReadonlySet<PurchasePhase> = new Set([
    "queued",
    "provisioning",
    "provisioning-unknown",
    "provisioning-refused",
    "provisioning-failed-retryable",
    "provisioning-failed-terminal",
    "refund-started",
    "refunded",
    "refund-pending-reconciliation",
    "service-eligibility-hold",
    "ready",
])

/** Phases whose truth can still move; the surface re-reads the same purchase on a slow interval. */
export const POLLING_PHASES: ReadonlySet<PurchasePhase> = new Set([
    "payment-pending",
    "payment-unknown",
    "paid",
    "queued",
    "provisioning",
    "provisioning-unknown",
    "refund-started",
    "refund-pending-reconciliation",
    "service-eligibility-hold",
])

/** Phases an entitlement hold re-renders as the hold state; refusal and refund truth stay itself. */
export const HOLD_PHASES: ReadonlySet<PurchasePhase> = new Set([
    "queued",
    "provisioning",
    "provisioning-unknown",
    "provisioning-failed-retryable",
    "provisioning-failed-terminal",
    "ready",
])

/** Provisioning-order dispositions the owner publishes once an order exists for the purchase. */
export const OBSERVED_ORDER_STATES: ReadonlySet<string> = new Set([
    "admitted",
    "running",
    "outcome-unknown",
    "refused",
    "failed-retryable",
    "failed-terminal",
    "ready",
])

/** The order fact is distinct from the purchase identity and exists only for an observed order. */
export const provisioningOrderRefOf = (purchase: WorkspaceCheckoutPurchaseStatusFieldsFragment): string | null =>
    OBSERVED_ORDER_STATES.has(purchase.provisioning.state) ? purchase.provisioning.reference : null

/**
 * The refund-family phase a refused paid order stands on. A settled refund is shown only beside
 * its linked ledger entry; an unavailable or unlinked projection remains pending reconciliation.
 */
const refundPhaseOf = (purchase: WorkspaceCheckoutPurchaseStatusFieldsFragment): PurchasePhase => {
    const refund = purchase.refund ?? purchase.refundStatus
    if (refund === null || refund === undefined) return "provisioning-refused"
    if (refund.state === "refunded") {
        const refundEntryId = purchase.refund?.refundEntryId ?? null
        const ledger = purchase.ledger
        const linked =
            refundEntryId !== null &&
            ledger !== null &&
            ledger.state === "observed" &&
            ledger.entries.some((entry) => entry.entryId === refundEntryId && entry.kind === "refund")
        return linked ? "refunded" : "refund-pending-reconciliation"
    }
    if (refund.state === "refund-started") return "refund-started"
    if (refund.state === "refund-pending-reconciliation") return "refund-pending-reconciliation"
    return "provisioning-refused"
}

/** The strongest purchase phase its composed billing, provisioning and readiness facts prove. */
export const phaseOf = (purchase: WorkspaceCheckoutPurchaseStatusFieldsFragment): PurchasePhase => {
    switch (purchase.state) {
        case "selected":
        case "payment-not-started":
        case "payment-pending":
            return "payment-pending"
        case "payment-outcome-unknown":
            return "payment-unknown"
        case "payment-refused":
            return "payment-refused"
        case "payment-failed":
            return "payment-failed"
        case "payment-cancelled":
            return "payment-cancelled"
        case "paid":
            return "paid"
        case "ready":
        case "renewed":
            return readinessPhaseOf(purchase.readiness.state)
        case "provisioning-refused":
            return refundPhaseOf(purchase)
        case "provisioning":
            switch (purchase.provisioning.state) {
                case "none":
                case "admitted":
                    return "queued"
                case "running":
                    return "provisioning"
                case "unavailable":
                case "outcome-unknown":
                    return "provisioning-unknown"
                case "refused":
                    return refundPhaseOf(purchase)
                case "failed-retryable":
                    return "provisioning-failed-retryable"
                case "failed-terminal":
                    return "provisioning-failed-terminal"
                case "ready":
                    return readinessPhaseOf(purchase.readiness.state)
                default:
                    return "provisioning"
            }
        default:
            return "payment-unknown"
    }
}

/** Readiness is settled only by the readiness facet's own state. */
const readinessPhaseOf = (state: WorkspaceCheckoutPurchaseStatusFieldsFragment["readiness"]["state"]): PurchasePhase => {
    if (state === "ready") return "ready"
    if (state === "unavailable") return "provisioning-unknown"
    return "provisioning"
}
