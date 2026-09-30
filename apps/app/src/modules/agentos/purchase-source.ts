import type { WorkspaceCheckoutPurchaseStatusFieldsFragment, WorkspaceEntryDestinationType } from "@/modules/api/__generated__/core"

import type { WorkspaceCheckoutAnswer } from "@/modules/api/workspace-controlplane"

/** Read the purchase view carried by a checkout outcome, when that outcome arm has one. */

export const purchaseOf = (outcome: WorkspaceCheckoutAnswer | null): WorkspaceCheckoutPurchaseStatusFieldsFragment | null =>
    outcome !== null && "purchase" in outcome && outcome.purchase !== undefined ? outcome.purchase : null

/** Source identities confirmed by one purchase view for a recovery request. */
export type WorkspaceCheckoutObservedIdentities = {
    readonly billingReceiptId?: string
    readonly provisioningOrderId?: string
    readonly workspaceId?: string
}

/** Collect only the source identities the observed purchase proves for safe recovery. */
export const observedIdentitiesOf = (purchase: WorkspaceCheckoutPurchaseStatusFieldsFragment): WorkspaceCheckoutObservedIdentities => ({
    ...(purchase.billing.reference !== null ? { billingReceiptId: purchase.billing.reference } : {}),
    ...(purchase.provisioning.reference !== null ? { provisioningOrderId: purchase.provisioning.reference } : {}),
    ...(purchase.readiness.state === "ready" && purchase.readiness.reference !== null
        ? { workspaceId: purchase.readiness.reference }
        : {}),
})

/** Resolve only the registered workspace-shell destination for a checkout entry. */
export const entryPathOf = (destination: WorkspaceEntryDestinationType): string | null => {
    if (destination.routeName === "instance-management.workspace-shell") return `/agentos/workspaces/${destination.workspaceId}`
    return null
}
