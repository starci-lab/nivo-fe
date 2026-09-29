/** Workspace controller contracts. Chatbot browser traffic is always mediated by Core. */

import { catalogItems, createWalletTopUpPayLink, myCatalogOrders, myInvoices, orderAgentOs, payInvoice, type CatalogCategory, type CatalogItemRow, type CatalogOrderStatus, type InvoiceRow, type InvoiceStatus, type WalletTopUpPayLink } from "./commerce";
import { issueAgentWorkspaceAppLaunch, myAgentWorkspace, type AgentWorkspaceAppLaunch, type AgentWorkspaceRow } from "./agentos-workspaces";
import { graphql, graphqlFields } from "./graphql";
import { failed, failureKindOfCode, type Outcome } from "./outcome";

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
type ChatbotEnvelope<T> = {
  readonly data?: T;
  readonly errors?: ReadonlyArray<{
    readonly message?: string;
  }>;
};
const WORKSPACE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
type ChatbotCoreOperation = "workbench" | "bind-channel" | "start-zalo-oauth" | "set-handoff" | "resolve-handoff" | "reconcile-delivery";
const CHATBOT_UNAVAILABLE = (reason: string) => failed("unavailable", { code: "WORKSPACE_CONTROLLER_UNAVAILABLE", reason });

/*
 * The Chatbot boundary keeps three refusal codes a screen may key on: REFUSED (the session was not
 * accepted or may not do this), UNREACHABLE (no reply arrived) and FAILED (a reply arrived and was
 * not an answer). The kind and status of the failure travel beside them.
 */
const chatbotCoreRequest = async <T,>(workspaceId: string, accessToken: string, installationId: string, operation: ChatbotCoreOperation, input?: Readonly<Record<string, unknown>>): Promise<Outcome<T>> => {
  if (!WORKSPACE_ID.test(workspaceId) || accessToken.length === 0) return CHATBOT_UNAVAILABLE("The workspace or the credential is not usable.");
  const read = operation === "workbench";
  const field = read ? "chatbotWorkspaceWorkbench" : "chatbotWorkspaceCommand";
  const answered = await graphqlFields(
    `${read ? "query" : "mutation"} ChatbotWorkspaceGateway($request: ${read ? "ChatbotWorkspaceReadRequest" : "ChatbotWorkspaceCommandRequest"}!) { ${field}(request: $request) }`,
    { request: { workspaceId, installationId, ...(read ? {} : { operation, input: input ?? {} }) } },
    { accessToken }
  );
  if (!answered.ok) {
    const code = answered.kind === "refused" || answered.kind === "forbidden" ? "WORKSPACE_CONTROLLER_REFUSED" : answered.status === null ? "WORKSPACE_CONTROLLER_UNREACHABLE" : "WORKSPACE_CONTROLLER_FAILED";
    return failed(answered.kind, { status: answered.status, code, reason: answered.reason });
  }
  const envelope = answered.data[field] as ChatbotEnvelope<T> | undefined;
  if (envelope?.data === undefined || (envelope.errors?.length ?? 0) > 0) return failed("unavailable", { code: "WORKSPACE_CONTROLLER_FAILED", reason: "The controller answered without a payload." });
  return { ok: true, data: envelope.data };
};

/** Read the accepted installation-qualified Chatbot workbench contract. */
export const chatbotWorkbench = async (_hostname: string, workspaceId: string, accessToken: string, installationId: string): Promise<Outcome<ChatbotWorkbench>> => {
  const result = await chatbotCoreRequest<{ readonly chatbotWorkbench: ChatbotWorkbench }>(workspaceId, accessToken, installationId, "workbench");
  return result.ok ? { ok: true, data: result.data.chatbotWorkbench } : result;
};

const mutateChatbot = async (workspaceId: string, accessToken: string, installationId: string, operation: ChatbotCoreOperation, input: Readonly<Record<string, unknown>>, field: string): Promise<Outcome<ChatbotCommandResult>> => {
  const result = await chatbotCoreRequest<Readonly<Record<string, ChatbotCommandResult>>>(workspaceId, accessToken, installationId, operation, input);
  if (!result.ok) return result;
  const action = result.data[field];
  return action === undefined ? failed("unavailable", { code: "WORKSPACE_CONTROLLER_FAILED", reason: "The controller answered without the requested action." }) : { ok: true, data: action };
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
 * server's own words, so this section returns the transport's `Outcome`, reason included.
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
export const listWorkspacePurchaseOffers = (category: CatalogCategory): Promise<Outcome<ReadonlyArray<WorkspacePurchaseOffer>>> => catalogItems(category);

/**
 * Order statuses whose purchase is still the same admitted checkout. A repeat inside the reuse
 * window resolves to that receipt rather than a second purchase; `cancelled` and `suspended` are
 * absent on purpose - a terminal purchase admits a fresh checkout.
 */
const REUSABLE_ORDER_STATUSES: ReadonlySet<CatalogOrderStatus> = new Set(["active", "completed", "in_progress", "pending_payment"]);

/** How long an exact repeat of one admitted checkout resolves to the receipt it already earned. */
const CHECKOUT_RECEIPT_TTL_MS = 10 * 60 * 1000;

/** Checkouts still in flight, keyed by their canonical request meaning: offer slug plus rung. */
const checkoutInFlight = new Map<string, Promise<Outcome<WorkspacePurchaseReceipt>>>();

/** Receipts recent checkouts earned; a repeat re-reads the purchase before it may reuse one. */
const checkoutReceipts = new Map<string, { readonly at: number; readonly receipt: WorkspacePurchaseReceipt }>();

const admitWorkspaceCheckout = async (offerSlug: string, tierId?: string): Promise<Outcome<WorkspacePurchaseReceipt>> => {
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
 * Admit one purchase of a selected offer (contract operation `start-checkout`).
 *
 * THE ORDER ROW THE BACKEND RETURNS IS THE PURCHASE: its id is the stable purchase identity and an
 * exact repeat of the same admitted checkout returns the same row rather than a second purchase.
 * No payment is claimed by this call - paying is a separate, explicitly reconciled action.
 *
 * DOUBLE-SUBMIT SAFETY IS BOUNDED, NOT INFINITE. A repeat while the first request is in flight
 * joins that request, and a repeat inside the reuse window resolves to the recorded receipt only
 * after re-reading the purchase and finding it still standing - a terminal purchase admits a
 * fresh checkout and an unverifiable one refuses rather than creating a blind second charge. A
 * repeat from another tab or device cannot be deduplicated here; the canonical order mutation
 * accepts no caller idempotency key, so only the backend can make cross-session repeats safe.
 *
 * @param offerSlug - The selected offer's address fragment.
 * @param tierId - The selected rung, when the offer is tiered.
 * @returns The admitted purchase, or why checkout was refused.
 */
export const startWorkspaceCheckout = async (offerSlug: string, tierId?: string): Promise<Outcome<WorkspacePurchaseReceipt>> => {
  const checkoutKey = `${offerSlug}:${tierId ?? ""}`;
  const recorded = checkoutReceipts.get(checkoutKey);
  if (recorded !== undefined && Date.now() - recorded.at < CHECKOUT_RECEIPT_TTL_MS) {
    const status = await readWorkspacePurchaseStatus(recorded.receipt.purchaseId);
    if (!status.ok) return status;
    if (status.data.order.state === "observed") {
      if (REUSABLE_ORDER_STATUSES.has(status.data.order.status)) return { ok: true, data: recorded.receipt };
      checkoutReceipts.delete(checkoutKey);
    } else if (status.data.order.state === "missing") {
      checkoutReceipts.delete(checkoutKey);
    } else {
      const code = status.data.order.code ?? "purchase-source-unavailable";
      return failed(failureKindOfCode(code), { code, reason: status.data.order.code ?? "purchase source unavailable" });
    }
  }
  const pending = checkoutInFlight.get(checkoutKey);
  if (pending !== undefined) return pending;
  const admitted = admitWorkspaceCheckout(offerSlug, tierId);
  checkoutInFlight.set(checkoutKey, admitted);
  try {
    const result = await admitted;
    if (result.ok) checkoutReceipts.set(checkoutKey, { at: Date.now(), receipt: result.data });
    return result;
  } finally {
    checkoutInFlight.delete(checkoutKey);
  }
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
export const readWorkspacePurchaseStatus = async (purchaseId: string): Promise<Outcome<WorkspacePurchaseStatus>> => {
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
export const payWorkspacePurchaseInvoice = (invoiceId: string): Promise<Outcome<InvoiceRow>> => payInvoice(invoiceId);

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
export const createWorkspacePurchasePayLink = (input: WorkspacePurchasePayLinkInput): Promise<Outcome<WorkspacePurchasePayLink>> => createWalletTopUpPayLink(input.amountVnd, input.returnUrl, input.cancelUrl);

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
export const workspaceProvisioningSaga = (sagaId: string): Promise<Outcome<WorkspaceProvisioningSagaView>> => graphql(`query WorkspaceProvisioningSaga($input: MyProvisioningSagaInput!) { myProvisioningSaga(request: $input) { data { saga ${WORKSPACE_PROVISIONING_SAGA} steps ${WORKSPACE_PROVISIONING_SAGA_STEP} } message success error } }`, {
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
export const retryWorkspaceProvisioningSaga = (sagaId: string): Promise<Outcome<WorkspaceProvisioningSaga>> => graphql(`mutation RetryWorkspaceProvisioningSaga($input: RetryProvisioningSagaInput!) { retryProvisioningSaga(request: $input) { data ${WORKSPACE_PROVISIONING_SAGA} message success error } }`, {
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
export const cancelWorkspaceProvisioningSaga = (sagaId: string): Promise<Outcome<WorkspaceProvisioningSaga>> => graphql(`mutation CancelWorkspaceProvisioningSaga($input: CancelProvisioningSagaInput!) { cancelProvisioningSaga(request: $input) { data ${WORKSPACE_PROVISIONING_SAGA} message success error } }`, {
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
export const resolvePurchasedWorkspaceEntry = (workspaceId: string): Promise<Outcome<PurchasedWorkspaceEntry>> => issueAgentWorkspaceAppLaunch(workspaceId);

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
export const retryWorkspaceProvisioningOrder = (workspaceId: string): Promise<Outcome<AgentWorkspaceRow>> => graphql(`mutation ManageAgentWorkspace($input: ManageAgentWorkspaceInput!) { manageAgentWorkspace(request: $input) { data { id name status catalogOrder { id } } message success error } }`, {
  input: {
    agentWorkspaceId: workspaceId,
    action: "retry_provision"
  }
});

/*
 * ---------------------------------------------------------------------------
 * THE WORKSPACE-CHECKOUT BOUNDARY.
 *
 * EVERY PURCHASE FUNCTION ABOVE IS BOUND TO THE CONSOLE'S GENERIC SURFACE - `catalogItems`, `orderAgentOs`, `myCatalogOrders`, `myInvoices`, `myAgentWorkspace`, `payInvoice`, `createWalletTopUpPayLink` - and that binding is why a purchase screen could only ever describe a generic order: whatever provider name the wallet top-up happened to carry, whatever the invoice row happened to say, and no rail for the purchaser to choose, because the generic order surface has no rail. The workspace-provision feature now publishes its own boundary over the real purchase process (`src/features/workspace-provision/transport/graphql`), and this section binds to it.
 *
 * NOTHING ABOVE IS REMOVED. The chatbot workbench and the console screens that still read the generic surface keep every export they had, so both surfaces are reachable at once and a screen can move one call at a time.
 *
 * THE ANSWER IS A CLOSED OUTCOME, NOT AN ERROR. `offers`, `prepared` and `status` carry payloads; `refused`, `unavailable`, `conflict` and `outcome-unknown` are terminal answers that never claim a paid, provisioning or ready fact - so a caller must read `status` before it reads any fact, and `ok` alone never means the purchase advanced.
 * ---------------------------------------------------------------------------
 */

/** The two owner-approved domestic payment rails a checkout may select; a missing choice never starts an attempt. */
export type WorkspaceCheckoutPaymentRail = "vnpay" | "momo";

/**
 * Lifecycle cursor of one purchase.
 *
 * THE CURSOR IS THE PROCESS, NOT THE BROWSER: only a confirmed transition
 * moves it, so a provider return or an elapsed timer can never advance it.
 */
export type WorkspaceCheckoutPurchaseState =
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
  | "payment-cancelled";

/** Closed refusal and failure codes of the checkout contract. */
export type WorkspaceCheckoutRefusalCode =
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
  | "observed-identity-mismatch";

/** Verified-Login door an admission refusal points at, when the caller must become an admitted purchaser. */
export type WorkspaceCheckoutNextAction = "login-sign-in" | "login-register" | "login-verify-email";

/** Verdict on the requested offer identity and version against the current catalog. */
export type WorkspaceCheckoutSelectionState = "current" | "stale" | "unavailable";

/** One currently approved offer as the purchaser may see it. */
export type WorkspaceCheckoutOffer = {
  readonly offerId: string;
  readonly offerVersion: string;
  readonly displayName: string;
  readonly includedOutcome: string;
  readonly amount: string;
  readonly currency: string;
  readonly billingCadence: string;
  readonly renewalMode: string;
  readonly eligibility: string;
};

/** Verdict on the selected offer identity and version. */
export type WorkspaceCheckoutSelection = {
  readonly offerId: string;
  readonly offerVersion: string;
  readonly state: WorkspaceCheckoutSelectionState;
};

/** One source-qualified fact facet; `state` uses the owning source's own vocabulary, and `unavailable` is never a stronger claim. */
export type WorkspaceCheckoutSourceFact = {
  readonly source: string;
  readonly state: string;
  readonly reference: string | null;
  readonly observedAt: string | null;
};

/** Provisioning owner's exact disposition and caller-safe reason, beside the shared order state. */
export type WorkspaceCheckoutProvisioningFact = WorkspaceCheckoutSourceFact & {
  readonly disposition: string | null;
  readonly reason: string | null;
};

/** Explicit next-period payment offered only to an entitled owner; never a new operation. */
export type WorkspaceCheckoutRenewalAction = {
  readonly operation: string;
  readonly offerId: string;
  readonly offerVersion: string;
  readonly amount: string;
  readonly currency: string;
};

/** Current entitlement and hold facts; `renewalEvidence` never lifts a hold by itself. */
export type WorkspaceCheckoutEligibilityFact = WorkspaceCheckoutSourceFact & {
  readonly reason: string | null;
  readonly heldSince: string | null;
  readonly paidThrough: string | null;
  readonly renewalAction: WorkspaceCheckoutRenewalAction | null;
  readonly renewalEvidence: string;
};

/** One immutable posted billing entry with its adjustment link. */
export type WorkspaceCheckoutBillingEntry = {
  readonly entryId: string;
  readonly purchaseId: string;
  readonly billingReceiptId: string;
  readonly kind: string;
  readonly amount: string;
  readonly currency: string;
  readonly linkedEntryId: string | null;
  readonly observationId: string | null;
  readonly actorPrincipal: string | null;
  readonly reason: string | null;
  readonly paymentRail: string | null;
  readonly providerTransactionRef: string | null;
  readonly accountingCopyState: string;
  readonly postedAt: string;
};

/** Purchaser-scoped ledger facts of one purchase, in posting order. */
export type WorkspaceCheckoutLedgerFact = {
  readonly source: string;
  readonly state: string;
  readonly ledgerState: string | null;
  readonly entries: ReadonlyArray<WorkspaceCheckoutBillingEntry>;
  readonly observedAt: string | null;
};

/** Refund facet of a definitively refused paid order, with the source markers that qualify it. */
export type WorkspaceCheckoutRefundFact = WorkspaceCheckoutSourceFact & {
  readonly projection: string;
  readonly refundEntryId: string | null;
};

/**
 * Composed purchase truth: the process cursor plus distinct source-qualified facets.
 *
 * ADMISSION IS NOT READINESS, AND A SETTLED PAYMENT IS NOT A READY WORKSPACE:
 * every facet names its owning source, so a screen shows exactly the one fact
 * that source confirmed and nothing wider.
 */
export type WorkspaceCheckoutStatusView = {
  readonly purchaseId: string;
  readonly state: WorkspaceCheckoutPurchaseState;
  readonly offer: WorkspaceCheckoutOffer;
  readonly payment: WorkspaceCheckoutSourceFact;
  readonly billing: WorkspaceCheckoutSourceFact;
  readonly provisioning: WorkspaceCheckoutProvisioningFact;
  readonly readiness: WorkspaceCheckoutSourceFact;
  readonly serviceEligibility: WorkspaceCheckoutEligibilityFact | null;
  readonly ledger: WorkspaceCheckoutLedgerFact | null;
  readonly refund: WorkspaceCheckoutRefundFact | null;
  readonly refundStatus: WorkspaceCheckoutSourceFact | null;
  readonly lastConfirmedAt: string;
};

/** Provider action the purchaser must complete; the payload carries no purchase authority. */
export type WorkspaceCheckoutPaymentAction = {
  readonly paymentAttemptId: string;
  readonly provider: string;
  readonly kind: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

/**
 * Closed result union of the workspace-checkout boundary.
 *
 * `prepared` and `status` always carry the composed purchase view: the
 * boundary's own contract declares it for those two arms, so a caller switches
 * on `status` and then reads the fact it asked for.
 */
export type WorkspaceCheckoutAnswer =
  | {
    readonly status: "offers";
    readonly offers: ReadonlyArray<WorkspaceCheckoutOffer>;
    readonly selection: WorkspaceCheckoutSelection;
  }
  | {
    readonly status: "prepared";
    readonly purchaseId: string | null;
    readonly purchase: WorkspaceCheckoutStatusView;
    readonly paymentAction: WorkspaceCheckoutPaymentAction | null;
  }
  | {
    readonly status: "status";
    readonly purchaseId: string | null;
    readonly purchase: WorkspaceCheckoutStatusView;
  }
  | {
    readonly status: "refused";
    readonly code: WorkspaceCheckoutRefusalCode;
    readonly nextAction?: WorkspaceCheckoutNextAction;
    readonly purchaseId?: string;
    readonly offers?: ReadonlyArray<WorkspaceCheckoutOffer>;
    readonly purchase?: WorkspaceCheckoutStatusView;
  }
  | {
    readonly status: "unavailable";
    readonly code: "source-unavailable";
    readonly source: string;
    readonly purchaseId?: string;
  }
  | {
    readonly status: "conflict";
    readonly code: "retry-identity-conflict" | "observed-identity-mismatch";
    readonly purchaseId?: string;
  }
  | {
    readonly status: "outcome-unknown";
    readonly code: "outcome-unknown";
    readonly purchaseId?: string;
  };

/** Versioned return context naming the purchaser-scoped surface a resolved entry returns to. */
export type WorkspaceCheckoutEntryReturnContext = {
  readonly name: string;
  readonly version: string;
};

/** Registered entry destination: structured owner data, never a caller-selected URL. */
export type WorkspaceCheckoutEntryDestination = {
  readonly workspaceId: string;
  readonly ownerId: string;
  readonly routeName: string;
  readonly routeVersion: string;
  readonly context: Readonly<Record<string, unknown>>;
};

/** Closed refusal codes of the purchased-workspace entry contract. */
export type WorkspaceCheckoutEntryRefusalCode =
  | "unauthenticated"
  | "purchaser-not-admitted"
  | "purchase-not-found-non-disclosing"
  | "request-invalid"
  | "owner-mismatch"
  | "workspace-not-found-non-disclosing"
  | "workspace-not-ready"
  | "readiness-observation-stale"
  | "entry-unsupported";

/** Closed result union of the purchased-workspace entry boundary. */
export type WorkspaceCheckoutEntryOutcome =
  | {
    readonly status: "entry";
    readonly purchaseId: string | null;
    readonly workspaceId: string;
    readonly destination: WorkspaceCheckoutEntryDestination;
  }
  | {
    readonly status: "not-ready";
    readonly purchaseId: string | null;
    readonly purchase: WorkspaceCheckoutStatusView;
  }
  | {
    readonly status: "refused";
    readonly code: WorkspaceCheckoutEntryRefusalCode;
    readonly purchaseId?: string;
  }
  | {
    readonly status: "unavailable";
    readonly code: "source-unavailable" | "entry-owner-unavailable";
    readonly source: string;
    readonly purchaseId?: string;
  }
  | {
    readonly status: "conflict";
    readonly code: "observed-identity-mismatch";
    readonly purchaseId?: string;
  };

/** Last source identities the caller observed; each is compared against the confirmed record. */
export type WorkspaceCheckoutObservedIdentities = {
  readonly paymentAttemptId?: string;
  readonly providerReference?: string;
  readonly billingReceiptId?: string;
  readonly provisioningOrderId?: string;
  readonly workspaceId?: string;
};

/**
 * `start-checkout` request.
 *
 * `retryKey` IS THE RETRY IDENTITY, NOT A CACHE KEY: identical reuse replays
 * the same purchase and changed meaning conflicts, so a caller derives it from
 * the purchase it intends rather than from the moment it pressed.
 */
export type WorkspaceCheckoutStartRequest = {
  readonly retryKey: string;
  readonly offerId: string;
  readonly offerVersion: string;
  readonly paymentRail: WorkspaceCheckoutPaymentRail;
  readonly renewalEntitlementId?: string;
};

/** `request-safe-recovery` request: the purchase plus the identities the caller last observed. */
export type WorkspaceCheckoutRecoverRequest = {
  readonly purchaseId: string;
  readonly lastObserved?: WorkspaceCheckoutObservedIdentities;
};

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
  readonly purchaseId: string;
  readonly workspaceId: string;
  readonly returnContext?: WorkspaceCheckoutEntryReturnContext;
};

/** Offer selection reused by every outcome selection that answers offers. */
const WORKSPACE_CHECKOUT_OFFER_FIELDS = `offerId offerVersion displayName includedOutcome amount currency billingCadence renewalMode eligibility`;

/** Source-qualified facet selection reused by every facet that carries no extra field. */
const WORKSPACE_CHECKOUT_SOURCE_FIELDS = `source state reference observedAt`;

/** Composed purchase view selection, including the facets only purchase-status composes. */
const WORKSPACE_CHECKOUT_STATUS_FIELDS = `
  purchaseId
  state
  offer { ${WORKSPACE_CHECKOUT_OFFER_FIELDS} }
  payment { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} }
  billing { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} }
  provisioning { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} disposition reason }
  readiness { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} }
  serviceEligibility { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} reason heldSince paidThrough renewalEvidence renewalAction { operation offerId offerVersion amount currency } }
  ledger {
    source
    state
    ledgerState
    observedAt
    entries { entryId purchaseId billingReceiptId kind amount currency linkedEntryId observationId actorPrincipal reason paymentRail providerTransactionRef accountingCopyState postedAt }
  }
  refund { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} projection refundEntryId }
  refundStatus { ${WORKSPACE_CHECKOUT_SOURCE_FIELDS} }
  lastConfirmedAt
`;

/** Selection covering the whole closed checkout outcome union. */
const WORKSPACE_CHECKOUT_OUTCOME_FIELDS = `
  status
  code
  nextAction
  source
  purchaseId
  offers { ${WORKSPACE_CHECKOUT_OFFER_FIELDS} }
  selection { offerId offerVersion state }
  purchase { ${WORKSPACE_CHECKOUT_STATUS_FIELDS} }
  paymentAction { paymentAttemptId provider kind payload }
`;

/** Selection covering the whole closed purchase-entry outcome union. */
const WORKSPACE_CHECKOUT_ENTRY_FIELDS = `
  status
  code
  source
  purchaseId
  workspaceId
  destination { workspaceId ownerId routeName routeVersion context }
  purchase { ${WORKSPACE_CHECKOUT_STATUS_FIELDS} }
`;

/**
 * Select an offer and read the current approved ones (contract operation
 * `select-offer`).
 *
 * THE SELECTION IS DATA, NOT AUTHORITY: the backend decides whether this
 * purchaser may buy this exact offer version now and answers `current`,
 * `stale` or `unavailable` with the same list either way.
 *
 * @param offerId - The offer identity the screen is presenting.
 * @param offerVersion - The exact version presented, never a floating "latest".
 * @returns The closed outcome, or why no answer arrived.
 */
export const readWorkspaceCheckoutOffers = (offerId: string, offerVersion: string): Promise<Outcome<WorkspaceCheckoutAnswer>> => graphql(`query WorkspaceCheckoutOffers($request: WorkspaceCheckoutOffersInput!) { workspaceCheckoutOffers(request: $request) { data { ${WORKSPACE_CHECKOUT_OUTCOME_FIELDS} } message success error } }`, {
  request: {
    offerId,
    offerVersion
  }
});

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
export const startWorkspaceCheckoutPurchase = (request: WorkspaceCheckoutStartRequest): Promise<Outcome<WorkspaceCheckoutAnswer>> => graphql(`mutation WorkspaceCheckoutStart($request: WorkspaceCheckoutStartInput!) { workspaceCheckoutStart(request: $request) { data { ${WORKSPACE_CHECKOUT_OUTCOME_FIELDS} } message success error } }`, {
  request: {
    retryKey: request.retryKey,
    offerId: request.offerId,
    offerVersion: request.offerVersion,
    paymentRail: request.paymentRail,
    renewalEntitlementId: request.renewalEntitlementId
  }
});

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
export const readWorkspaceCheckoutStatus = (purchaseId: string): Promise<Outcome<WorkspaceCheckoutAnswer>> => graphql(`query WorkspacePurchaseStatus($request: WorkspacePurchaseStatusInput!) { workspacePurchaseStatus(request: $request) { data { ${WORKSPACE_CHECKOUT_OUTCOME_FIELDS} } message success error } }`, {
  request: {
    purchaseId
  }
});

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
export const recoverWorkspacePurchase = (request: WorkspaceCheckoutRecoverRequest): Promise<Outcome<WorkspaceCheckoutAnswer>> => graphql(`mutation WorkspacePurchaseRecover($request: WorkspacePurchaseRecoverInput!) { workspacePurchaseRecover(request: $request) { data { ${WORKSPACE_CHECKOUT_OUTCOME_FIELDS} } message success error } }`, {
  request: {
    purchaseId: request.purchaseId,
    lastObserved: request.lastObserved
  }
});

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
export const resolveWorkspaceCheckoutEntry = (request: WorkspaceCheckoutEntryRequest): Promise<Outcome<WorkspaceCheckoutEntryOutcome>> => graphql(`query WorkspacePurchaseEntry($request: WorkspacePurchaseEntryInput!) { workspacePurchaseEntry(request: $request) { data { ${WORKSPACE_CHECKOUT_ENTRY_FIELDS} } message success error } }`, {
  request: {
    purchaseId: request.purchaseId,
    workspaceId: request.workspaceId,
    returnContext: request.returnContext
  }
});
