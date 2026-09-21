/** Workspace controller contracts. Chatbot browser traffic is always mediated by Core. */

import {
  catalogItems,
  createWalletTopUpPayLink,
  issueAgentWorkspaceAppLaunch,
  myAgentWorkspace,
  myCatalogOrders,
  myInvoices,
  orderAgentOs,
  payInvoice,
  type AgentWorkspaceAppLaunch,
  type CatalogCategory,
  type CatalogItemRow,
  type CatalogOrderStatus,
  type InvoiceRow,
  type InvoiceStatus,
  type WalletTopUpPayLink
} from "./console";
import { graphql, type Result } from "./graphql";

/** The Chatbot boundary's own result: a payload, or the single refusal code a screen may key on. */
export type WorkspaceControlplaneResult<T> = {
  readonly ok: true;
  readonly data: T;
} | {
  readonly ok: false;
  readonly code: string;
};

/** One installation-qualified channel projection; credential material never crosses this boundary. */
export type ChatbotChannelBinding = {
  readonly id: string;
  readonly installationId: string;
  readonly provider: "telegram" | "zalo" | string;
  readonly accountRef: string;
  readonly state: string;
  readonly credentialRef: string | null;
};

/** One conversation owned by exactly one Chatbot installation. */
export type ChatbotConversation = {
  readonly id: string;
  readonly installationId: string;
  readonly participantRef: string;
  readonly handoffState: string;
  readonly authorityEpoch: number;
  readonly approvedVersion: number | null;
  readonly lastMessageAt: string;
};

/** Truthful recorded delivery state; ambiguous is never treated as sent. */
export type ChatbotMessage = {
  readonly id: string;
  readonly conversationId: string;
  readonly direction: string;
  readonly sequence: string;
  readonly body: string;
  readonly deliveryState: string;
  readonly providerOutboxId: string | null;
  readonly failureCode: string | null;
  readonly occurredAt: string;
};

/** Complete read model for one installed Chatbot workbench. */
export type ChatbotWorkbench = {
  readonly installationId: string;
  readonly lifecycleState: string;
  readonly approvedVersion: number | null;
  readonly channels: ReadonlyArray<ChatbotChannelBinding>;
  readonly conversations: ReadonlyArray<ChatbotConversation>;
  readonly messages: ReadonlyArray<ChatbotMessage>;
};

/** Stable command result returned after installation-scoped readback. */
export type ChatbotCommandResult = {
  readonly id: string;
  readonly installationId: string;
  readonly state: string;
  readonly authorizationUrl?: string | null;
};
type GraphqlEnvelope<T> = {
  readonly data?: T;
  readonly errors?: ReadonlyArray<{
    readonly message?: string;
  }>;
};
const WORKSPACE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
type ChatbotCoreOperation = "workbench" | "bind-channel" | "start-zalo-oauth" | "set-handoff" | "resolve-handoff" | "reconcile-delivery";
const chatbotCoreEndpoint = (workspaceId: string): string | null => {
  if (!WORKSPACE_ID.test(workspaceId)) return null;
  try {
    return new URL(process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql").toString();
  } catch {
    return null;
  }
};
const chatbotCoreRequest = async <T,>(workspaceId: string, accessToken: string, installationId: string, operation: ChatbotCoreOperation, input?: Readonly<Record<string, unknown>>): Promise<WorkspaceControlplaneResult<T>> => {
  const endpoint = chatbotCoreEndpoint(workspaceId);
  if (endpoint === null || accessToken.length === 0) return { ok: false, code: "WORKSPACE_CONTROLLER_UNAVAILABLE" };
  try {
    const read = operation === "workbench";
    const field = read ? "chatbotWorkspaceWorkbench" : "chatbotWorkspaceCommand";
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query: `${read ? "query" : "mutation"} ChatbotWorkspaceGateway($request: ${read ? "ChatbotWorkspaceReadRequest" : "ChatbotWorkspaceCommandRequest"}!) { ${field}(request: $request) }`,
        variables: {
          request: { workspaceId, installationId, ...(read ? {} : { operation, input: input ?? {} }) }
        }
      })
    });
    const outer = (await response.json()) as {
      readonly data?: Readonly<Record<string, GraphqlEnvelope<T>>>;
      readonly errors?: ReadonlyArray<{ readonly message?: string }>;
    };
    const envelope = outer.data?.[field];
    if (!response.ok || envelope?.data === undefined || (outer.errors?.length ?? 0) > 0 || (envelope.errors?.length ?? 0) > 0) return {
      ok: false,
      code: response.status === 401 || response.status === 403 ? "WORKSPACE_CONTROLLER_REFUSED" : "WORKSPACE_CONTROLLER_FAILED"
    };
    return { ok: true, data: envelope.data };
  } catch {
    return { ok: false, code: "WORKSPACE_CONTROLLER_UNREACHABLE" };
  }
};

/** Read the accepted installation-qualified Chatbot workbench contract. */
export const chatbotWorkbench = async (_hostname: string, workspaceId: string, accessToken: string, installationId: string): Promise<WorkspaceControlplaneResult<ChatbotWorkbench>> => {
  const result = await chatbotCoreRequest<{ readonly chatbotWorkbench: ChatbotWorkbench }>(workspaceId, accessToken, installationId, "workbench");
  return result.ok ? { ok: true, data: result.data.chatbotWorkbench } : result;
};

const mutateChatbot = async (workspaceId: string, accessToken: string, installationId: string, operation: ChatbotCoreOperation, input: Readonly<Record<string, unknown>>, field: string): Promise<WorkspaceControlplaneResult<ChatbotCommandResult>> => {
  const result = await chatbotCoreRequest<Readonly<Record<string, ChatbotCommandResult>>>(workspaceId, accessToken, installationId, operation, input);
  if (!result.ok) return result;
  const action = result.data[field];
  return action === undefined ? { ok: false, code: "WORKSPACE_CONTROLLER_FAILED" } : { ok: true, data: action };
};

/** Bind an opaque, already-sealed channel reference to one installation. */
export const bindChatbotChannel = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "bind-channel", input, "bindChatbotChannel");

/** Start a one-time Zalo OAuth intent; the browser receives no provider token. */
export const startChatbotZaloOauth = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "start-zalo-oauth", input, "startZaloChatbotAuthorization");

/** Fence one conversation into human mode before any later provider start. */
export const setChatbotHandoff = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "set-handoff", input, "setChatbotHandoff");

/** Resolve human mode only through the installation-qualified authority command. */
export const resolveChatbotHandoff = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "resolve-handoff", input, "resolveChatbotHandoff");

/** Reconcile ambiguous delivery evidence without issuing a blind resend. */
export const reconcileChatbotDelivery = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "reconcile-delivery", {
    ...input,
    outboxId: input.providerOutboxId,
    terminalState: input.outcome === "delivered" ? "sent" : "failed",
    evidenceRef: `operator://manual-reconciliation/${String(input.providerOutboxId)}`,
    providerOutboxId: undefined,
    outcome: undefined
  }, "reconcileChatbotDelivery");

/** Narrow transport hooks exposed only for focused endpoint-policy tests. */
export const workspaceControlplaneTesting = {
  chatbotCoreEndpoint
};

/*
 * Workspace purchase boundary (contract.workspace-provision.workspace-checkout and
 * contract.workspace-provision.purchased-workspace-entry).
 *
 * THE DEDICATED WORKSPACE-PROVISION MODULE HAS NO PUBLISHED GRAPHQL SURFACE YET, so each contract
 * operation is bound to the current owned capability the SDS already names for it: a
 * `catalog_orders` row is the purchase identity, its invoice is the billing fact, the
 * `agent_workspaces` row keyed on that order is the provisioning/readiness fact, a provisioning
 * saga is the durable step record, and an instance-management app launch is the workspace entry
 * grant. When the feature surface ships, only these bindings move - the exported vocabulary stays.
 *
 * NO READ BELOW INFERS A STATE THE WIRE DID NOT RETURN. A missing invoice is "not-raised", a
 * refused source is "unavailable", a missing workspace is "not-admitted", and only a persisted
 * `paid` invoice reports paid. Browser redirects, provider acceptance pages, local state and
 * elapsed time never enter these results, so a screen cannot mistake them for a fact.
 *
 * RESULTS CARRY THE REFUSAL SENTENCE, NOT JUST A CODE. The purchase screens owe the reader the
 * server's own words, so this section returns the transport's `Result` rather than the narrower
 * `WorkspaceControlplaneResult` the Chatbot boundary above uses.
 */

/** One currently published workspace offer; the catalog row IS the offer the contract names. */
export type WorkspacePurchaseOffer = CatalogItemRow;

/** The stable purchase identity admitted by checkout; the catalog order row IS the purchase. */
export type WorkspacePurchaseReceipt = {
  /** The purchase identity; an exact repeat of the same admitted checkout returns the same one. */
  readonly purchaseId: string;
  /** The order row's own lifecycle status, verbatim. */
  readonly status: CatalogOrderStatus;
  /** The frozen offer the purchase was admitted under, when the order still carries it. */
  readonly offer: {
    readonly id: string;
    readonly name: string;
  } | null;
  /** The frozen tier the purchase was admitted under, when the order still carries it. */
  readonly tier: {
    readonly id: string;
    readonly name: string;
  } | null;
};

/** The order-source fact of one purchase status read. */
export type WorkspacePurchaseOrderFact =
  | {
    readonly state: "observed";
    readonly status: CatalogOrderStatus;
    readonly offerName: string | null;
    readonly tierName: string | null;
  }
  | { readonly state: "missing" }
  | { readonly state: "unavailable"; readonly code: string | null };

/** The billing-source fact of one purchase status read. */
export type WorkspacePurchasePaymentFact =
  | { readonly state: "not-raised" }
  | {
    readonly state: "observed";
    readonly invoiceId: string;
    readonly status: InvoiceStatus;
    readonly amountVnd: number;
    readonly paidAt: string | null;
  }
  | { readonly state: "unavailable"; readonly code: string | null };

/** The provisioning-source fact of one purchase status read. */
export type WorkspacePurchaseProvisioningFact =
  | { readonly state: "not-admitted" }
  | {
    readonly state: "observed";
    readonly workspaceId: string;
    readonly workspaceName: string | null;
    readonly workspaceStatus: string;
  }
  | { readonly state: "unavailable"; readonly code: string | null };

/**
 * Source-qualified status of one purchase.
 *
 * EACH FACT KEEPS THE NAME OF ITS OWN SOURCE and never borrows another's verdict: an invoice-less
 * order is "not-raised", never "failed"; a timed-out source is "unavailable", never a verdict;
 * "missing" is non-disclosing on purpose. Only a persisted invoice status of "paid" reports paid,
 * and only a bound workspace row reports that provisioning produced a workspace.
 */
export type WorkspacePurchaseStatus = {
  readonly purchaseId: string;
  /** When this snapshot was assembled; display-only, never a state authority. */
  readonly observedAt: string;
  readonly order: WorkspacePurchaseOrderFact;
  readonly payment: WorkspacePurchasePaymentFact;
  readonly provisioning: WorkspacePurchaseProvisioningFact;
};

/** The lifecycle states a provisioning saga's own enum can report. */
export type WorkspaceProvisioningSagaStatus = "queued" | "running_forward" | "waiting_retry" | "compensating" | "completed" | "compensated" | "compensation_failed";

/** The lifecycle states one durable saga step's own enum can report. */
export type WorkspaceProvisioningSagaStepStatus = "pending" | "running" | "completed" | "failed" | "compensating" | "compensated" | "compensation_failed" | "skipped";

/** The durable record of one purchase-bound provisioning order, as `myProvisioningSaga` reports it. */
export type WorkspaceProvisioningSaga = {
  readonly id: string;
  readonly jobId: string;
  readonly definitionKey: string;
  readonly definitionVersion: number;
  readonly resourceKind: string;
  readonly resourceId: string;
  readonly ownerId: string;
  readonly status: WorkspaceProvisioningSagaStatus;
  readonly direction: "forward" | "compensating";
  readonly forwardCursor: number;
  readonly compensationCursor: number | null;
  readonly sequence: number;
  readonly failureCode: string | null;
  readonly failureReason: string | null;
  readonly finishedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** One durable forward/compensation step inside the saga read model. */
export type WorkspaceProvisioningSagaStep = {
  readonly id: string;
  readonly stepKey: string;
  readonly ordinal: number;
  readonly isCompensable: boolean;
  readonly forwardStatus: WorkspaceProvisioningSagaStepStatus;
  readonly compensationStatus: WorkspaceProvisioningSagaStepStatus;
  readonly lastError: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** The saga row together with every step it has recorded so far. */
export type WorkspaceProvisioningSagaView = {
  readonly saga: WorkspaceProvisioningSaga;
  readonly steps: ReadonlyArray<WorkspaceProvisioningSagaStep>;
};

/** The provider-hosted payment action raised for one purchase invoice. */
export type WorkspacePurchasePayLink = WalletTopUpPayLink;

/** What raising one provider-hosted payment action requires. */
export type WorkspacePurchasePayLinkInput = {
  /** The invoice amount, in dong. */
  readonly amountVnd: number;
  /** Where the provider returns a completed checkout; a return is an acceptance page, never a receipt. */
  readonly returnUrl: string;
  /** Where the provider returns an abandoned checkout. */
  readonly cancelUrl: string;
};

/** The readiness-gated entry grant issued by instance-management, never a caller-chosen address. */
export type PurchasedWorkspaceEntry = AgentWorkspaceAppLaunch;

/** The fields a saga row carries, identical for the view and for the recovery mutations. */
const WORKSPACE_PROVISIONING_SAGA = "{ id jobId definitionKey definitionVersion resourceKind resourceId ownerId status direction forwardCursor compensationCursor sequence failureCode failureReason finishedAt createdAt updatedAt }";

/** The fields one saga step carries. */
const WORKSPACE_PROVISIONING_SAGA_STEP = "{ id stepKey ordinal isCompensable forwardStatus compensationStatus lastError createdAt updatedAt }";

/**
 * List the workspace offers a purchaser may select (contract operation `select-offer`).
 *
 * @param category - Which catalogue slice publishes the workspace offers.
 * @returns The offers, or why there are none.
 */
export const listWorkspacePurchaseOffers = (category: CatalogCategory): Promise<Result<ReadonlyArray<WorkspacePurchaseOffer>>> => catalogItems(category);

/**
 * Admit one purchase of a selected offer (contract operation `start-checkout`).
 *
 * THE ORDER ROW THE BACKEND RETURNS IS THE PURCHASE: its id is the stable purchase identity and an
 * exact repeat of the same admitted checkout returns the same row rather than a second purchase.
 * No payment is claimed by this call - paying is a separate, explicitly reconciled action.
 *
 * @param offerSlug - The selected offer's address fragment.
 * @param tierId - The selected rung, when the offer is tiered.
 * @returns The admitted purchase, or why checkout was refused.
 */
export const startWorkspaceCheckout = async (offerSlug: string, tierId?: string): Promise<Result<WorkspacePurchaseReceipt>> => {
  const order = await orderAgentOs(offerSlug, tierId);
  if (!order.ok) return order;
  return {
    ok: true,
    data: {
      purchaseId: order.data.id,
      status: order.data.status,
      offer: order.data.catalogItem,
      tier: order.data.catalogTier
    }
  };
};

/**
 * Read the source-qualified status of one purchase (contract operation `read-purchase-status`).
 *
 * THREE SOURCES ANSWER INDEPENDENTLY AND EACH KEEPS ITS NAME. The order row, the invoice row and
 * the bound workspace row are read together; a source that refuses is reported as unavailable
 * beside the facts the others confirmed, so a slow billing read can never pass for a paid invoice
 * nor hide an already-bound workspace. When no source answered at all the read fails closed.
 *
 * @param purchaseId - The purchase identity returned by {@link startWorkspaceCheckout}.
 * @returns The status, or why no source could be read.
 */
export const readWorkspacePurchaseStatus = async (purchaseId: string): Promise<Result<WorkspacePurchaseStatus>> => {
  const [orders, invoices, workspaces] = await Promise.all([myCatalogOrders(), myInvoices(), myAgentWorkspace()]);
  if (!orders.ok && !invoices.ok && !workspaces.ok) return orders;
  const order = orders.ok ? orders.data.find((row) => row.id === purchaseId) : undefined;
  const invoice = invoices.ok ? invoices.data.find((row) => row.catalogOrder?.id === purchaseId) : undefined;
  const workspace = workspaces.ok ? workspaces.data.find((row) => row.catalogOrder?.id === purchaseId) : undefined;
  return {
    ok: true,
    data: {
      purchaseId,
      observedAt: new Date().toISOString(),
      order: !orders.ok ? {
        state: "unavailable",
        code: orders.code ?? null
      } : order === undefined ? {
        state: "missing"
      } : {
        state: "observed",
        status: order.status,
        offerName: order.catalogItem?.name ?? null,
        tierName: order.catalogTier?.name ?? null
      },
      payment: !invoices.ok ? {
        state: "unavailable",
        code: invoices.code ?? null
      } : invoice === undefined ? {
        state: "not-raised"
      } : {
        state: "observed",
        invoiceId: invoice.id,
        status: invoice.status,
        amountVnd: invoice.amountVnd,
        paidAt: invoice.paidAt
      },
      provisioning: !workspaces.ok ? {
        state: "unavailable",
        code: workspaces.code ?? null
      } : workspace === undefined ? {
        state: "not-admitted"
      } : {
        state: "observed",
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceStatus: workspace.status
      }
    }
  };
};

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
export const payWorkspacePurchaseInvoice = (invoiceId: string): Promise<Result<InvoiceRow>> => payInvoice(invoiceId);

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
export const createWorkspacePurchasePayLink = (input: WorkspacePurchasePayLinkInput): Promise<Result<WorkspacePurchasePayLink>> => createWalletTopUpPayLink(input.amountVnd, input.returnUrl, input.cancelUrl);

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
export const workspaceProvisioningSaga = (sagaId: string): Promise<Result<WorkspaceProvisioningSagaView>> => graphql(`query WorkspaceProvisioningSaga($input: MyProvisioningSagaInput!) { myProvisioningSaga(input: $input) { data { saga ${WORKSPACE_PROVISIONING_SAGA} steps ${WORKSPACE_PROVISIONING_SAGA_STEP} } message success error } }`, {
  input: {
    sagaId
  }
});

/**
 * Ask the backend to resume one stalled provisioning order (a `request-safe-recovery` action).
 *
 * SAFE RETRY IS THE SAGA RUNNER'S DECISION: the backend refuses a saga that is not waiting on a
 * retry, so an exact repeat resumes the same durable order and a conflicting request fails closed.
 *
 * @param sagaId - The provisioning order identity.
 * @returns The saga row as it now stands, or why the retry was refused.
 */
export const retryWorkspaceProvisioningSaga = (sagaId: string): Promise<Result<WorkspaceProvisioningSaga>> => graphql(`mutation RetryWorkspaceProvisioningSaga($input: RetryProvisioningSagaInput!) { retryProvisioningSaga(input: $input) { data ${WORKSPACE_PROVISIONING_SAGA} message success error } }`, {
  input: {
    sagaId
  }
});

/**
 * Ask the backend to abandon one provisioning order (a `request-safe-recovery` action).
 *
 * @param sagaId - The provisioning order identity.
 * @returns The saga row as it now stands, or why the cancellation was refused.
 */
export const cancelWorkspaceProvisioningSaga = (sagaId: string): Promise<Result<WorkspaceProvisioningSaga>> => graphql(`mutation CancelWorkspaceProvisioningSaga($input: CancelProvisioningSagaInput!) { cancelProvisioningSaga(input: $input) { data ${WORKSPACE_PROVISIONING_SAGA} message success error } }`, {
  input: {
    sagaId
  }
});

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
export const resolvePurchasedWorkspaceEntry = (workspaceId: string): Promise<Result<PurchasedWorkspaceEntry>> => issueAgentWorkspaceAppLaunch(workspaceId);
