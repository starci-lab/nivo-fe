import { type Outcome } from "@nivo/api"
import { graphql } from "../graphql"
import {
    WorkspacePurchaseEntryDocument,
    WorkspacePurchaseRecoverDocument,
    WorkspacePurchaseStatusDocument,
} from "../__generated__/core"
import type { WorkspacePurchaseEntryInput, WorkspacePurchaseRecoverInput } from "../__generated__/core"
import { parseWorkspaceCheckoutAnswer, parseWorkspaceCheckoutEntryOutcome } from "./payload.guards"
import type { WorkspaceCheckoutAnswer, WorkspaceCheckoutEntryOutcome } from "./checkout-types"

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
    graphql(WorkspacePurchaseStatusDocument, parseWorkspaceCheckoutAnswer, { request: { purchaseId } })

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
    request: WorkspacePurchaseRecoverInput,
): Promise<Outcome<WorkspaceCheckoutAnswer>> =>
    graphql(WorkspacePurchaseRecoverDocument, parseWorkspaceCheckoutAnswer, { request })

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
    request: WorkspacePurchaseEntryInput,
): Promise<Outcome<WorkspaceCheckoutEntryOutcome>> =>
    graphql(WorkspacePurchaseEntryDocument, parseWorkspaceCheckoutEntryOutcome, { request })
