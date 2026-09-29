import type {
    WorkspaceCheckoutStatusView,
} from "@/modules/api/workspace-controlplane"
import type { Outcome } from "@/modules/api/outcome"
import type { WorkspaceCheckoutAnswer } from "@/modules/api/workspace-controlplane"
import type { PurchaseStatusCopy } from "./copy"
import type { PurchasePhase } from "./phase"
import type { PurchaseStatusLinks } from "./view-model"

/** Locale-bound formatters the pure view derivation needs for observed timestamps and amounts. */
export type PurchaseStatusFormatters = {
    readonly timeOf: (iso: string) => string
    readonly stampOf: (iso: string) => string
    readonly dayOf: (iso: string) => string
    readonly amountOf: (amount: string, currency: string) => string
    readonly elapsedOf: (iso: string, now: string) => string
}

/** User actions the pure view maps onto the phase's primary action. */
export type PurchaseStatusActionCallbacks = {
    readonly reconcile: () => void
    readonly recover: () => void
    readonly returnToList: () => void
    readonly changeOffer: () => void
    readonly viewProvisioning: () => void
    readonly enterWorkspace: () => void
    readonly renewEntitlement: () => void
}

/** Resolved source data and actions used by the pure purchase-status view derivation. */
export type PurchaseStatusPresentationContext = {
    readonly purchaseId: string
    readonly surfacePinned?: "provisioning"
    readonly phase: PurchasePhase
    readonly answer: Outcome<WorkspaceCheckoutAnswer> | undefined
    readonly outcome: WorkspaceCheckoutAnswer | null
    readonly purchase: WorkspaceCheckoutStatusView | null
    readonly readyWorkspaceId: string | null
    readonly purchaserFact: string | null
    readonly copy: PurchaseStatusCopy
    readonly links: PurchaseStatusLinks
    readonly format: PurchaseStatusFormatters
    readonly entryRefusal: string | null
    readonly recoverRefusal: string | null
    readonly entryPending: boolean
    readonly recovering: boolean
    readonly reconciling: boolean
    readonly actions: PurchaseStatusActionCallbacks
}
