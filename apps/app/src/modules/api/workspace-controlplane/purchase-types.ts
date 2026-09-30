
import type { CatalogOrderStatus, InvoiceStatus } from "../__generated__/core"

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
 * Source-qualified status view composed from the order, billing and workspace reads.
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

/** What raising one provider-hosted payment action requires. */
export type WorkspacePurchasePayLinkInput = {
    /** The invoice amount, in dong. */
    readonly amountVnd: number
    /** Where the provider returns a completed checkout; a return is an acceptance page, never a receipt. */
    readonly returnUrl: string
    /** Where the provider returns an abandoned checkout. */
    readonly cancelUrl: string
}
