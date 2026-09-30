import type {
    WorkspaceEntryDestinationType,
    WorkspaceOfferSelectionType,
    WorkspaceOfferType,
    WorkspacePaymentActionType,
    WorkspacePurchaseStatusType,
} from "../__generated__/core"

/** Payment providers currently accepted by workspace checkout. */
export type WorkspaceCheckoutPaymentRail = "vnpay" | "momo"

/**
 * Lifecycle cursor of one purchase in the checkout view.
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

/** Refusal and failure codes retained by the closed checkout view. */
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

/** Verified-Login door an admission refusal points at. */
type WorkspaceCheckoutNextAction = "login-sign-in" | "login-register" | "login-verify-email"

/** Verdict on the requested offer identity and version. */
type WorkspaceCheckoutSelectionState = "current" | "stale" | "unavailable"

/**
 * Closed result view of the workspace-checkout boundary.
 *
 * The parser maps the schema's nullable response object into status-specific arms so consumers can
 * switch on `status` and handle only the fields that belong to that answer.
 */
export type WorkspaceCheckoutAnswer =
    | {
          readonly status: "offers"
          readonly offers: ReadonlyArray<WorkspaceOfferType>
          readonly selection: WorkspaceOfferSelectionType
      }
    | {
          readonly status: "prepared"
          readonly purchaseId: string | null
          readonly purchase: WorkspacePurchaseStatusType
          readonly paymentAction: WorkspacePaymentActionType | null
      }
    | {
          readonly status: "status"
          readonly purchaseId: string | null
          readonly purchase: WorkspacePurchaseStatusType
      }
    | {
          readonly status: "refused"
          readonly code: WorkspaceCheckoutRefusalCode
          readonly nextAction?: WorkspaceCheckoutNextAction
          readonly purchaseId?: string
          readonly offers?: ReadonlyArray<WorkspaceOfferType>
          readonly purchase?: WorkspacePurchaseStatusType
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

/** Closed refusal codes of the purchased-workspace entry view. */
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

/** Closed result view of the purchased-workspace entry boundary. */
export type WorkspaceCheckoutEntryOutcome =
    | {
          readonly status: "entry"
          readonly purchaseId: string | null
          readonly workspaceId: string
          readonly destination: WorkspaceEntryDestinationType
      }
    | {
          readonly status: "not-ready"
          readonly purchaseId: string | null
          readonly purchase: WorkspacePurchaseStatusType
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
