import { type Outcome } from "@nivo/api"
import { createWalletTopUpPayLink, payInvoice } from "../commerce"
import { graphql } from "../graphql"
import { issueAgentWorkspaceAppLaunch } from "../agentos-workspaces"
import {
    CancelWorkspaceProvisioningSagaDocument,
    ManageAgentWorkspaceDocument,
    RetryWorkspaceProvisioningSagaDocument,
    WorkspaceProvisioningSagaDocument,
} from "../__generated__/core"
import type {
    CreateWalletTopUpPayLinkMutation,
    IssueAgentWorkspaceAppLaunchMutation,
    ManageAgentWorkspaceMutation,
    PayInvoiceMutation,
    ProvisioningSagaEntity,
    WorkspaceProvisioningSagaQuery,
} from "../__generated__/core"
import { parseAgentWorkspaceRowAnswer } from "../agentos-workspaces.guards"
import { parseProvisioningSaga, parseProvisioningSagaView } from "./payload.guards"
import type { WorkspacePurchasePayLinkInput } from "./purchase-types"

/**
 * Settle one purchase invoice from wallet balance (a `request-safe-recovery` action).
 *
 * THE BACKEND'S OWN BILLING MUTATION IS THE SAFE RETRY: a refused or already-settled invoice comes
 * back as a refusal carrying the server's sentence, so repeating the action can never double-charge
 * nor claim a payment the ledger did not record.
 *
 * @param invoiceId - The unpaid invoice reported by {@link readWorkspacePurchaseStatus}.
 * @returns The canonical invoice, or why settlement was refused.
 */
export const payWorkspacePurchaseInvoice = (
    invoiceId: string,
): Promise<Outcome<NonNullable<PayInvoiceMutation["payInvoice"]["data"]>>> => payInvoice(invoiceId)

/**
 * Raise the provider-hosted payment action for one purchase invoice (a `request-safe-recovery`
 * action).
 *
 * THE RETURNED URL IS A PROVIDER ACCEPTANCE PAGE, NOT A RECEIPT: checkout completion must be
 * reconciled through {@link readWorkspacePurchaseStatus}, which only reports paid when the billing
 * ledger recorded it.
 *
 * @param input - The invoice amount and the provider's return/cancel addresses.
 * @returns The hosted checkout details, or why none could be raised.
 */
export const createWorkspacePurchasePayLink = (
    input: WorkspacePurchasePayLinkInput,
): Promise<Outcome<NonNullable<CreateWalletTopUpPayLinkMutation["createWalletTopUpPayLink"]["data"]>>> =>
    createWalletTopUpPayLink(input.amountVnd, input.returnUrl, input.cancelUrl)

/**
 * Read the durable provisioning order bound to one purchase (contract operation
 * `read-provisioning`).
 *
 * THE SAGA IS THE RECORD, NOT A PROJECTION: its status, cursor and step rows are persisted truth,
 * so a replayed or stale copy can still be reconciled by `sequence` and `updatedAt`.
 *
 * @param sagaId - The provisioning order identity observed through the realtime stream.
 * @returns The saga and its steps, or why the read was refused.
 */
export const workspaceProvisioningSaga = (
    sagaId: string,
): Promise<Outcome<NonNullable<WorkspaceProvisioningSagaQuery["myProvisioningSaga"]["data"]>>> =>
    graphql(WorkspaceProvisioningSagaDocument, parseProvisioningSagaView, { input: { sagaId } })

/**
 * Ask the backend to resume one stalled provisioning order (a `request-safe-recovery` action).
 *
 * SAFE RETRY IS THE SAGA RUNNER'S DECISION: the backend refuses a saga that is not waiting on a
 * retry, so an exact repeat resumes the same durable order and a conflicting request fails closed.
 *
 * @param sagaId - The provisioning order identity.
 * @returns The saga row as it now stands, or why the retry was refused.
 */
export const retryWorkspaceProvisioningSaga = (sagaId: string): Promise<Outcome<ProvisioningSagaEntity>> =>
    graphql(RetryWorkspaceProvisioningSagaDocument, parseProvisioningSaga, { input: { sagaId } })

/**
 * Ask the backend to abandon one provisioning order (a `request-safe-recovery` action).
 *
 * @param sagaId - The provisioning order identity.
 * @returns The saga row as it now stands, or why the cancellation was refused.
 */
export const cancelWorkspaceProvisioningSaga = (sagaId: string): Promise<Outcome<ProvisioningSagaEntity>> =>
    graphql(CancelWorkspaceProvisioningSagaDocument, parseProvisioningSaga, { input: { sagaId } })

/**
 * Resolve the entry grant for one owned, ready workspace (contract operation
 * `resolve-purchased-workspace-entry`).
 *
 * THE DESTINATION IS ISSUED, NEVER CHOSEN: the backend returns a single-use launch grant for the
 * exact workspace the caller owns, and an unready or unowned workspace is refused rather than
 * navigated to.
 *
 * @param workspaceId - The bound workspace reported by {@link readWorkspacePurchaseStatus}.
 * @returns The launch grant, or why entry was refused.
 */
export const resolvePurchasedWorkspaceEntry = (
    workspaceId: string,
): Promise<Outcome<NonNullable<IssueAgentWorkspaceAppLaunchMutation["issueAgentWorkspaceAppLaunch"]["data"]>>> =>
    issueAgentWorkspaceAppLaunch(workspaceId)

/**
 * Ask the backend to re-drive provisioning of one failed workspace (the `retry-provisioning-order`
 * action).
 *
 * THE WORKSPACE ROW IS THE FENCED RETRY IDENTITY. `manageAgentWorkspace` admits `retry_provision`
 * only while the bound workspace stands in `failed`, lands it back in `provisioning`, and refuses
 * every other lifecycle position - so a repeat can never admit a second workspace or resurrect a
 * terminal one. The saga-level `retryProvisioningSaga` mutation remains for callers that already
 * hold a saga identity; the purchase-status surface observes only the workspace row, and this is
 * the owner-scoped recovery the backend published for exactly that observation.
 *
 * @param workspaceId - The failed workspace reported by {@link readWorkspacePurchaseStatus}.
 * @returns The workspace row as it now stands, or why the retry was refused.
 */
export const retryWorkspaceProvisioningOrder = (
    workspaceId: string,
): Promise<Outcome<NonNullable<ManageAgentWorkspaceMutation["manageAgentWorkspace"]["data"]>>> =>
    graphql(ManageAgentWorkspaceDocument, parseAgentWorkspaceRowAnswer, {
        input: {
            agentWorkspaceId: workspaceId,
            action: "retry_provision",
        },
    })
