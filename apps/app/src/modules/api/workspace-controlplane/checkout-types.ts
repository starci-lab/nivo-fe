/** Payment providers currently accepted by workspace checkout. */
export type WorkspaceCheckoutPaymentRail = "vnpay" | "momo"

/**
 * Lifecycle cursor of one purchase.
 *
 * THE CURSOR IS THE PROCESS, NOT THE BROWSER: only a confirmed transition
 * moves it, so a provider return or an elapsed timer can never advance it.
 */
type WorkspaceCheckoutPurchaseState =
    | "selected"
    | "payment-not-started"
    | "payment-pending"
    | "payment-outcome-unknown"
    | "payment-refused"
    | "payment-failed"
    | "paid"
    | "provisioning"
    | "provisioning-refused"
    | "ready"
    | "renewed"
    | "payment-cancelled"

/** Closed refusal and failure codes of the checkout contract. */
type WorkspaceCheckoutRefusalCode =
    | "unauthenticated"
    | "purchaser-not-admitted"
    | "offer-unavailable"
    | "offer-version-stale"
    | "retry-identity-conflict"
    | "purchase-not-found-non-disclosing"
    | "source-unavailable"
    | "outcome-unknown"
    | "request-invalid"
    | "payment-refused"
    | "payment-failed"
    | "observed-identity-mismatch"

/** Verified-Login door an admission refusal points at, when the caller must become an admitted purchaser. */
type WorkspaceCheckoutNextAction = "login-sign-in" | "login-register" | "login-verify-email"

/** Verdict on the requested offer identity and version against the current catalog. */
type WorkspaceCheckoutSelectionState = "current" | "stale" | "unavailable"

/** One currently approved offer as the purchaser may see it. */
export type WorkspaceCheckoutOffer = {
    readonly offerId: string
    readonly offerVersion: string
    readonly displayName: string
    readonly includedOutcome: string
    readonly amount: string
    readonly currency: string
    readonly billingCadence: string
    readonly renewalMode: string
    readonly eligibility: string
}

/** Verdict on the selected offer identity and version. */
export type WorkspaceCheckoutSelection = {
    readonly offerId: string
    readonly offerVersion: string
    readonly state: WorkspaceCheckoutSelectionState
}

/** One source-qualified fact facet; `state` uses the owning source's own vocabulary, and `unavailable` is never a stronger claim. */
export type WorkspaceCheckoutSourceFact = {
    readonly source: string
    readonly state: string
    readonly reference: string | null
    readonly observedAt: string | null
}

/** Provisioning owner's exact disposition and caller-safe reason, beside the shared order state. */
export type WorkspaceCheckoutProvisioningFact = WorkspaceCheckoutSourceFact & {
    readonly disposition: string | null
    readonly reason: string | null
}

/** Explicit next-period payment offered only to an entitled owner; never a new operation. */
type WorkspaceCheckoutRenewalAction = {
    readonly operation: string
    readonly offerId: string
    readonly offerVersion: string
    readonly amount: string
    readonly currency: string
}

/** Current entitlement and hold facts; `renewalEvidence` never lifts a hold by itself. */
export type WorkspaceCheckoutEligibilityFact = WorkspaceCheckoutSourceFact & {
    readonly reason: string | null
    readonly heldSince: string | null
    readonly paidThrough: string | null
    readonly renewalAction: WorkspaceCheckoutRenewalAction | null
    readonly renewalEvidence: string
}

/** One immutable posted billing entry with its adjustment link. */
export type WorkspaceCheckoutBillingEntry = {
    readonly entryId: string
    readonly purchaseId: string
    readonly billingReceiptId: string
    readonly kind: string
    readonly amount: string
    readonly currency: string
    readonly linkedEntryId: string | null
    readonly observationId: string | null
    readonly actorPrincipal: string | null
    readonly reason: string | null
    readonly paymentRail: string | null
    readonly providerTransactionRef: string | null
    readonly accountingCopyState: string
    readonly postedAt: string
}

/** Purchaser-scoped ledger facts of one purchase, in posting order. */
export type WorkspaceCheckoutLedgerFact = {
    readonly source: string
    readonly state: string
    readonly ledgerState: string | null
    readonly entries: ReadonlyArray<WorkspaceCheckoutBillingEntry>
    readonly observedAt: string | null
}

/** Refund facet of a definitively refused paid order, with the source markers that qualify it. */
export type WorkspaceCheckoutRefundFact = WorkspaceCheckoutSourceFact & {
    readonly projection: string
    readonly refundEntryId: string | null
}

/**
 * Composed purchase truth: the process cursor plus distinct source-qualified facets.
 *
 * ADMISSION IS NOT READINESS, AND A SETTLED PAYMENT IS NOT A READY WORKSPACE:
 * every facet names its owning source, so a screen shows exactly the one fact
 * that source confirmed and nothing wider.
 */
export type WorkspaceCheckoutStatusView = {
    readonly purchaseId: string
    readonly state: WorkspaceCheckoutPurchaseState
    readonly offer: WorkspaceCheckoutOffer
    readonly payment: WorkspaceCheckoutSourceFact
    readonly billing: WorkspaceCheckoutSourceFact
    readonly provisioning: WorkspaceCheckoutProvisioningFact
    readonly readiness: WorkspaceCheckoutSourceFact
    readonly serviceEligibility: WorkspaceCheckoutEligibilityFact | null
    readonly ledger: WorkspaceCheckoutLedgerFact | null
    readonly refund: WorkspaceCheckoutRefundFact | null
    readonly refundStatus: WorkspaceCheckoutSourceFact | null
    readonly lastConfirmedAt: string
}

/** Provider action the purchaser must complete; the payload carries no purchase authority. */
export type WorkspaceCheckoutPaymentAction = {
    readonly paymentAttemptId: string
    readonly provider: string
    readonly kind: string
    readonly payload: Readonly<Record<string, unknown>>
}

/**
 * Closed result union of the workspace-checkout boundary.
 *
 * `prepared` and `status` always carry the composed purchase view: the
 * boundary's own contract declares it for those two arms, so a caller switches
 * on `status` and then reads the fact it asked for.
 */
export type WorkspaceCheckoutAnswer =
    | {
          readonly status: "offers"
          readonly offers: ReadonlyArray<WorkspaceCheckoutOffer>
          readonly selection: WorkspaceCheckoutSelection
      }
    | {
          readonly status: "prepared"
          readonly purchaseId: string | null
          readonly purchase: WorkspaceCheckoutStatusView
          readonly paymentAction: WorkspaceCheckoutPaymentAction | null
      }
    | {
          readonly status: "status"
          readonly purchaseId: string | null
          readonly purchase: WorkspaceCheckoutStatusView
      }
    | {
          readonly status: "refused"
          readonly code: WorkspaceCheckoutRefusalCode
          readonly nextAction?: WorkspaceCheckoutNextAction
          readonly purchaseId?: string
          readonly offers?: ReadonlyArray<WorkspaceCheckoutOffer>
          readonly purchase?: WorkspaceCheckoutStatusView
      }
    | {
          readonly status: "unavailable"
          readonly code: "source-unavailable"
          readonly source: string
          readonly purchaseId?: string
      }
    | {
          readonly status: "conflict"
          readonly code: "retry-identity-conflict" | "observed-identity-mismatch"
          readonly purchaseId?: string
      }
    | {
          readonly status: "outcome-unknown"
          readonly code: "outcome-unknown"
          readonly purchaseId?: string
      }

/** Versioned return context naming the purchaser-scoped surface a resolved entry returns to. */
type WorkspaceCheckoutEntryReturnContext = {
    readonly name: string
    readonly version: string
}

/** Registered entry destination: structured owner data, never a caller-selected URL. */
export type WorkspaceCheckoutEntryDestination = {
    readonly workspaceId: string
    readonly ownerId: string
    readonly routeName: string
    readonly routeVersion: string
    readonly context: Readonly<Record<string, unknown>>
}

/** Closed refusal codes of the purchased-workspace entry contract. */
type WorkspaceCheckoutEntryRefusalCode =
    | "unauthenticated"
    | "purchaser-not-admitted"
    | "purchase-not-found-non-disclosing"
    | "request-invalid"
    | "owner-mismatch"
    | "workspace-not-found-non-disclosing"
    | "workspace-not-ready"
    | "readiness-observation-stale"
    | "entry-unsupported"

/** Closed result union of the purchased-workspace entry boundary. */
export type WorkspaceCheckoutEntryOutcome =
    | {
          readonly status: "entry"
          readonly purchaseId: string | null
          readonly workspaceId: string
          readonly destination: WorkspaceCheckoutEntryDestination
      }
    | {
          readonly status: "not-ready"
          readonly purchaseId: string | null
          readonly purchase: WorkspaceCheckoutStatusView
      }
    | {
          readonly status: "refused"
          readonly code: WorkspaceCheckoutEntryRefusalCode
          readonly purchaseId?: string
      }
    | {
          readonly status: "unavailable"
          readonly code: "source-unavailable" | "entry-owner-unavailable"
          readonly source: string
          readonly purchaseId?: string
      }
    | {
          readonly status: "conflict"
          readonly code: "observed-identity-mismatch"
          readonly purchaseId?: string
      }

/** Last source identities the caller observed; each is compared against the confirmed record. */
export type WorkspaceCheckoutObservedIdentities = {
    readonly paymentAttemptId?: string
    readonly providerReference?: string
    readonly billingReceiptId?: string
    readonly provisioningOrderId?: string
    readonly workspaceId?: string
}

/**
 * `start-checkout` request.
 *
 * `retryKey` IS THE RETRY IDENTITY, NOT A CACHE KEY: identical reuse replays
 * the same purchase and changed meaning conflicts, so a caller derives it from
 * the purchase it intends rather than from the moment it pressed.
 */
export type WorkspaceCheckoutStartRequest = {
    readonly retryKey: string
    readonly offerId: string
    readonly offerVersion: string
    readonly paymentRail: WorkspaceCheckoutPaymentRail
    readonly renewalEntitlementId?: string
}

/** `request-safe-recovery` request: the purchase plus the identities the caller last observed. */
export type WorkspaceCheckoutRecoverRequest = {
    readonly purchaseId: string
    readonly lastObserved?: WorkspaceCheckoutObservedIdentities
}

/**
 * `resolve-purchased-workspace-entry` request: the purchase plus the claimed
 * ready workspace.
 *
 * THE READINESS OBSERVATION IS NOT A CALLER CLAIM. The entry owner derives the
 * authoritative observation from its own confirmed record, so the caller
 * supplies only the purchase it owns, the workspace it claims is ready, and
 * where the resolved destination returns to.
 */
export type WorkspaceCheckoutEntryRequest = {
    readonly purchaseId: string
    readonly workspaceId: string
    readonly returnContext?: WorkspaceCheckoutEntryReturnContext
}

/** Offer selection reused by every outcome selection that answers offers. */
