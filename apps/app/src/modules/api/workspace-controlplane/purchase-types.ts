import type { AgentWorkspaceAppLaunch } from "../agentos-workspaces"
import type {
    CatalogItemRow,
    CatalogOrderStatus,
    InvoiceStatus,
    WalletTopUpPayLink,
} from "../commerce"
/** Catalog offer shape consumed by the workspace purchase flow. */
export type WorkspacePurchaseOffer = CatalogItemRow

/** The stable purchase identity admitted by checkout; the catalog order row IS the purchase. */
export type WorkspacePurchaseReceipt = {
    /** The purchase identity; an exact repeat of the same admitted checkout returns the same one. */
    readonly purchaseId: string
    /** The order row's own lifecycle status, verbatim. */
    readonly status: CatalogOrderStatus
    /** The frozen offer the purchase was admitted under, when the order still carries it. */
    readonly offer: {
        readonly id: string
        readonly name: string
    } | null
    /** The frozen tier the purchase was admitted under, when the order still carries it. */
    readonly tier: {
        readonly id: string
        readonly name: string
    } | null
}

/** The order-source fact of one purchase status read. */
type WorkspacePurchaseOrderFact =
    | {
          readonly state: "observed"
          readonly status: CatalogOrderStatus
          readonly offerName: string | null
          readonly tierName: string | null
      }
    | { readonly state: "missing" }
    | { readonly state: "unavailable"; readonly code: string | null }

/** The billing-source fact of one purchase status read. */
type WorkspacePurchasePaymentFact =
    | { readonly state: "not-raised" }
    | {
          readonly state: "observed"
          readonly invoiceId: string
          readonly status: InvoiceStatus
          readonly amountVnd: number
          readonly paidAt: string | null
      }
    | { readonly state: "unavailable"; readonly code: string | null }

/** The provisioning-source fact of one purchase status read. */
type WorkspacePurchaseProvisioningFact =
    | { readonly state: "not-admitted" }
    | {
          readonly state: "observed"
          readonly workspaceId: string
          readonly workspaceName: string | null
          readonly workspaceStatus: string
      }
    | { readonly state: "unavailable"; readonly code: string | null }

/**
 * Source-qualified status of one purchase.
 *
 * EACH FACT KEEPS THE NAME OF ITS OWN SOURCE and never borrows another's verdict: an invoice-less
 * order is "not-raised", never "failed"; a timed-out source is "unavailable", never a verdict;
 * "missing" is non-disclosing on purpose. Only a persisted invoice status of "paid" reports paid,
 * and only a bound workspace row reports that provisioning produced a workspace.
 */
export type WorkspacePurchaseStatus = {
    readonly purchaseId: string
    /** When this snapshot was assembled; display-only, never a state authority. */
    readonly observedAt: string
    readonly order: WorkspacePurchaseOrderFact
    readonly payment: WorkspacePurchasePaymentFact
    readonly provisioning: WorkspacePurchaseProvisioningFact
}

/** The lifecycle states a provisioning saga's own enum can report. */
type WorkspaceProvisioningSagaStatus =
    | "queued"
    | "running_forward"
    | "waiting_retry"
    | "compensating"
    | "completed"
    | "compensated"
    | "compensation_failed"

/** The lifecycle states one durable saga step's own enum can report. */
type WorkspaceProvisioningSagaStepStatus =
    "pending" | "running" | "completed" | "failed" | "compensating" | "compensated" | "compensation_failed" | "skipped"

/** The durable record of one purchase-bound provisioning order, as `myProvisioningSaga` reports it. */
export type WorkspaceProvisioningSaga = {
    readonly id: string
    readonly jobId: string
    readonly definitionKey: string
    readonly definitionVersion: number
    readonly resourceKind: string
    readonly resourceId: string
    readonly ownerId: string
    readonly status: WorkspaceProvisioningSagaStatus
    readonly direction: "forward" | "compensating"
    readonly forwardCursor: number
    readonly compensationCursor: number | null
    readonly sequence: number
    readonly failureCode: string | null
    readonly failureReason: string | null
    readonly finishedAt: string | null
    readonly createdAt: string
    readonly updatedAt: string
}

/** One durable forward/compensation step inside the saga read model. */
export type WorkspaceProvisioningSagaStep = {
    readonly id: string
    readonly stepKey: string
    readonly ordinal: number
    readonly isCompensable: boolean
    readonly forwardStatus: WorkspaceProvisioningSagaStepStatus
    readonly compensationStatus: WorkspaceProvisioningSagaStepStatus
    readonly lastError: string | null
    readonly createdAt: string
    readonly updatedAt: string
}

/** The saga row together with every step it has recorded so far. */
export type WorkspaceProvisioningSagaView = {
    readonly saga: WorkspaceProvisioningSaga
    readonly steps: ReadonlyArray<WorkspaceProvisioningSagaStep>
}

/** The provider-hosted payment action raised for one purchase invoice. */
export type WorkspacePurchasePayLink = WalletTopUpPayLink

/** What raising one provider-hosted payment action requires. */
export type WorkspacePurchasePayLinkInput = {
    /** The invoice amount, in dong. */
    readonly amountVnd: number
    /** Where the provider returns a completed checkout; a return is an acceptance page, never a receipt. */
    readonly returnUrl: string
    /** Where the provider returns an abandoned checkout. */
    readonly cancelUrl: string
}

/** The readiness-gated entry grant issued by instance-management, never a caller-chosen address. */
export type PurchasedWorkspaceEntry = AgentWorkspaceAppLaunch

/** The fields a saga row carries, identical for the view and for the recovery mutations. */
