import type {
    WorkspaceCheckoutAnswer,
    WorkspaceCheckoutEntryDestination,
    WorkspaceCheckoutObservedIdentities,
    WorkspaceCheckoutStatusView,
} from "@/modules/api/workspace-controlplane"

/** Read the purchase view carried by a checkout outcome, when that outcome arm has one. */
export const purchaseOf = (outcome: WorkspaceCheckoutAnswer | null): WorkspaceCheckoutStatusView | null =>
    outcome !== null && "purchase" in outcome && outcome.purchase !== undefined ? outcome.purchase : null

/** Collect only the source identities the observed purchase proves for safe recovery. */
export const observedIdentitiesOf = (purchase: WorkspaceCheckoutStatusView): WorkspaceCheckoutObservedIdentities => ({
    ...(purchase.billing.reference !== null ? { billingReceiptId: purchase.billing.reference } : {}),
    ...(purchase.provisioning.reference !== null ? { provisioningOrderId: purchase.provisioning.reference } : {}),
    ...(purchase.readiness.state === "ready" && purchase.readiness.reference !== null
        ? { workspaceId: purchase.readiness.reference }
        : {}),
})

/** Resolve only the registered workspace-shell destination for a checkout entry. */
export const entryPathOf = (destination: WorkspaceCheckoutEntryDestination): string | null => {
    if (destination.routeName === "instance-management.workspace-shell") return `/agentos/workspaces/${destination.workspaceId}`
    return null
}
