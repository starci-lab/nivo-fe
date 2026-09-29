import { graphql } from "../graphql"
import type { Outcome } from "../outcome"
import {
    WORKSPACE_CHECKOUT_ENTRY_FIELDS,
    WORKSPACE_CHECKOUT_OUTCOME_FIELDS,
} from "./checkout-documents"
import { parseWorkspaceCheckoutAnswer, parseWorkspaceCheckoutEntryOutcome } from "./payload.guards"
import type {
    WorkspaceCheckoutAnswer,
    WorkspaceCheckoutEntryOutcome,
    WorkspaceCheckoutEntryRequest,
    WorkspaceCheckoutRecoverRequest,
    WorkspaceCheckoutStartRequest,
} from "./checkout-types"

/** Reads the approved offers and the verdict for the exact selected version. */
export const readWorkspaceCheckoutOffers = (
    offerId: string,
    offerVersion: string,
): Promise<Outcome<WorkspaceCheckoutAnswer>> =>
    graphql(
        `query WorkspaceCheckoutOffers($request: WorkspaceCheckoutOffersInput!) { workspaceCheckoutOffers(request: $request) { data { ${WORKSPACE_CHECKOUT_OUTCOME_FIELDS} } message success error } }`,
        parseWorkspaceCheckoutAnswer,
        {
            request: {
                offerId,
                offerVersion,
            },
        },
    )

/**
 * Admit one purchase and request its provider attempt (contract operation
 * `start-checkout`).
 *
 * THE RAIL IS THE PURCHASER'S EXPLICIT CHOICE: an absent rail never starts an
 * attempt, and the frozen snapshot - not the browser - is what billing,
 * provisioning and status are measured against. A returned payment action is
 * an instruction to complete, never a receipt.
 *
 * @param request - The retry identity, the frozen selection and the chosen rail.
 * @returns The closed outcome carrying the payment action, or why none was admitted.
 */
export const startWorkspaceCheckoutPurchase = (
    request: WorkspaceCheckoutStartRequest,
): Promise<Outcome<WorkspaceCheckoutAnswer>> =>
    graphql(
        `mutation WorkspaceCheckoutStart($request: WorkspaceCheckoutStartInput!) { workspaceCheckoutStart(request: $request) { data { ${WORKSPACE_CHECKOUT_OUTCOME_FIELDS} } message success error } }`,
        parseWorkspaceCheckoutAnswer,
        {
            request: {
                retryKey: request.retryKey,
                offerId: request.offerId,
                offerVersion: request.offerVersion,
                paymentRail: request.paymentRail,
                renewalEntitlementId: request.renewalEntitlementId,
            },
        },
    )

/**
 * Read one owned purchase's composed truth (contract operation
 * `read-purchase-status`).
 *
 * EACH FACET NAMES ITS OWN SOURCE, so this read is also the honest answer to
 * "is the workspace ready": `paid` is a settlement fact, `provisioning` an
 * admission fact and `readiness` the only fact that may say `ready`.
 *
 * @param purchaseId - The purchase identity to read; ownership resolves from the session, never from this value.
 * @returns The closed outcome, or why the read was refused.
 */
export const readWorkspaceCheckoutStatus = (purchaseId: string): Promise<Outcome<WorkspaceCheckoutAnswer>> =>
    graphql(
        `query WorkspacePurchaseStatus($request: WorkspacePurchaseStatusInput!) { workspacePurchaseStatus(request: $request) { data { ${WORKSPACE_CHECKOUT_OUTCOME_FIELDS} } message success error } }`,
        parseWorkspaceCheckoutAnswer,
        {
            request: {
                purchaseId,
            },
        },
    )

/**
 * Reconcile and advance one owned purchase through its original identities
 * only (contract operation `request-safe-recovery`).
 *
 * THIS IS THE SAFE RETRY: it reconciles an uncertain attempt, advances a
 * canonically settled purchase into provisioning and confirms exact
 * owned-workspace readiness, and a caller whose last observed identity
 * contradicts the confirmed record is refused rather than overwriting it.
 *
 * @param request - The purchase identity plus the identities the caller last observed.
 * @returns The closed outcome, or why the recovery was refused.
 */
export const recoverWorkspacePurchase = (
    request: WorkspaceCheckoutRecoverRequest,
): Promise<Outcome<WorkspaceCheckoutAnswer>> =>
    graphql(
        `mutation WorkspacePurchaseRecover($request: WorkspacePurchaseRecoverInput!) { workspacePurchaseRecover(request: $request) { data { ${WORKSPACE_CHECKOUT_OUTCOME_FIELDS} } message success error } }`,
        parseWorkspaceCheckoutAnswer,
        {
            request: {
                purchaseId: request.purchaseId,
                lastObserved: request.lastObserved,
            },
        },
    )

/**
 * Resolve the entry destination for one owned, readiness-confirmed workspace
 * (contract operation `resolve-purchased-workspace-entry`).
 *
 * THE DESTINATION IS REGISTERED, NEVER CHOSEN: the returned destination is
 * structured owner data for the exact workspace the provisioning owner
 * confirmed ready, and an unready, unowned or stale identity is answered
 * without disclosing sibling workspaces.
 *
 * @param request - The purchase and workspace identities the caller claims, plus its return context.
 * @returns The closed entry outcome, or why navigation stays withheld.
 */
export const resolveWorkspaceCheckoutEntry = (
    request: WorkspaceCheckoutEntryRequest,
): Promise<Outcome<WorkspaceCheckoutEntryOutcome>> =>
    graphql(
        `query WorkspacePurchaseEntry($request: WorkspacePurchaseEntryInput!) { workspacePurchaseEntry(request: $request) { data { ${WORKSPACE_CHECKOUT_ENTRY_FIELDS} } message success error } }`,
        parseWorkspaceCheckoutEntryOutcome,
        {
            request: {
                purchaseId: request.purchaseId,
                workspaceId: request.workspaceId,
                returnContext: request.returnContext,
            },
        },
    )
