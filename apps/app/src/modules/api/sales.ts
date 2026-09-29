/**
 * The installation-scoped Sales operation client: the eight Sales queries and the eight Sales
 * mutations registered by contract.sales.public-operations, each one POST to its own registered
 * `name@version` on the Core installation operation route, and the wire types of the sixteen
 * operations, the eight Sales-tagged result variants and `sales_refusal`.
 *
 * ONE OPERATION, ONE ADDRESS. The three installation coordinates and the registered name are the
 * whole address, and the name is written verbatim because the receiver matches its `@1` version
 * separator literally. The closed registered set is the only callable set: there is no generic
 * `request@1` here, and every function below names exactly one registered operation.
 *
 * THE STABLE IDENTITY IS THE `requestId`. The caller mints it once; an exact replay of the same
 * identity is one intent and returns the stored result, so this client never mints an identity and
 * never re-sends under a new one (nfr.sales.r-sales-idempotency).
 *
 * NOTHING IS PROMOTED. A receiver status the contract does not declare fails closed, an
 * `OPERATION_NOT_REGISTERED_FOR_INSTALLATION` stays a route refusal that names no Sales state, and an
 * unknown outcome is never success: it is reported as unknown and names the one registered read of
 * the same identity it can be reconciled by (fr.sales.fr-sales-recovery).
 */

import { failedWith, type Failure, type Outcome } from "./outcome";
import { isClosedRecord, isRouteErrorName, operationAddress, routeFailureKind, sendOperation, type InstallationScope } from "./operation-route";

/** Where one Sales installation lives: the three coordinates the route authenticates the caller to. */
export type SalesInstallationScope = InstallationScope;

/** The eight registered Sales queries. */
export type SalesQueryName =
  | "sales.policy@1"
  | "sales.readiness@1"
  | "sales.opportunity@1"
  | "sales.pipeline@1"
  | "sales.command@1"
  | "sales.decisionRequest@1"
  | "sales.action@1"
  | "sales.handoff@1";

/** The eight registered Sales mutations. */
export type SalesMutationName =
  | "sales.configurePolicy@1"
  | "sales.submitCommand@1"
  | "sales.clarifyCommand@1"
  | "sales.decideProposal@1"
  | "sales.close@1"
  | "sales.prepareHandoff@1"
  | "sales.submitHandoff@1"
  | "sales.recoverAction@1";

/** The closed registered set of sixteen operations. */
export type SalesOperationName = SalesQueryName | SalesMutationName;

/** The registered queries, in contract order. */
export const SALES_QUERY_NAMES: ReadonlyArray<SalesQueryName> = [
  "sales.policy@1",
  "sales.readiness@1",
  "sales.opportunity@1",
  "sales.pipeline@1",
  "sales.command@1",
  "sales.decisionRequest@1",
  "sales.action@1",
  "sales.handoff@1"
];

/** The registered mutations, in contract order. */
export const SALES_MUTATION_NAMES: ReadonlyArray<SalesMutationName> = [
  "sales.configurePolicy@1",
  "sales.submitCommand@1",
  "sales.clarifyCommand@1",
  "sales.decideProposal@1",
  "sales.close@1",
  "sales.prepareHandoff@1",
  "sales.submitHandoff@1",
  "sales.recoverAction@1"
];

/**
 * The one registered read each mutation is reconciled by.
 *
 * contract.sales.public-operations binds every mutation's outcome to exactly one read of the same
 * Sales-owned object, and this is that binding: a mutation whose answer was lost is settled by
 * reading the same identity back, never by sending it again. A query registers no such read.
 */
export const SALES_RECONCILIATIONS: Readonly<Partial<Record<SalesOperationName, SalesQueryName>>> = {
  "sales.configurePolicy@1": "sales.policy@1",
  "sales.submitCommand@1": "sales.command@1",
  "sales.clarifyCommand@1": "sales.command@1",
  "sales.decideProposal@1": "sales.decisionRequest@1",
  "sales.close@1": "sales.opportunity@1",
  "sales.prepareHandoff@1": "sales.handoff@1",
  "sales.submitHandoff@1": "sales.handoff@1",
  "sales.recoverAction@1": "sales.action@1"
};

/** The closed refusal reasons of contract.sales.public-operations. */
export type SalesRefusalReason = "DENIED" | "INVALID" | "CONFLICT" | "UNAVAILABLE";

/** One Sales refusal: its reason, the receiver's finer code, and whatever the receiver disclosed. */
export interface SalesRefusal {
  readonly reason: SalesRefusalReason;
  readonly code: string;
  readonly item: string | null;
  readonly currentRevision: number | null;
}

/** The failure code of one refusal; each reason is its own typed failure. */
export type SalesRefusalCode =
  | "SALES_REFUSED_DENIED"
  | "SALES_REFUSED_INVALID"
  | "SALES_REFUSED_CONFLICT"
  | "SALES_REFUSED_UNAVAILABLE";

/**
 * What one failed Sales answer adds to the common failure fields.
 *
 * The `code` is one of the route's closed error names, one of `outcome_unknown` and
 * `DEADLINE_EXCEEDED` (the effect is unattested), one of the four `SALES_REFUSED_*` codes, or a
 * transport condition (`UNAUTHENTICATED`, `UNREACHABLE`, `MALFORMED_ANSWER`,
 * `UNEXPECTED_RESULT_KIND`, `UNEXPECTED_RESULT_STATUS`, `ECHOED_IDENTITY_MISMATCH`).
 */
export type SalesFailureDetail = {
  readonly operation: SalesOperationName;
  readonly requestId: string | null;
  readonly reconciles: SalesQueryName | null;
  readonly refusal: SalesRefusal | null;
};

/** One answer this client refuses to report as a served Sales variant. */
export type SalesFailure = Failure<SalesFailureDetail>;

/** One Sales answer: the operation's own variant value, or a failure that names why it is unresolved. */
export type SalesAnswer<TValue> = Outcome<TValue, SalesFailureDetail>;

/** One requested command action of the bounded Sales planner. */
export type SalesRequestedAction = "qualify" | "contact" | "request-decision" | "prepare-handoff" | "close";

/** The closed object selectors one Sales command plan names. */
export interface SalesCommandScope {
  readonly customerRefs: ReadonlyArray<string>;
  readonly opportunityIds: ReadonlyArray<string>;
  readonly offerRefs: ReadonlyArray<string>;
}

/** The one permitted fact that resolves a pending command clarification. */
export type SalesClarificationFact =
  | { readonly customerRef: string }
  | { readonly opportunityId: string };

/** A durable server-established worker fence. */
export interface SalesWriterFence {
  readonly claimTokenHash: string;
  readonly fencedAt: string;
}

/**
 * The complete proposed engagement-operating-policy value set.
 *
 * A null member records no value for that item: Sales defaults nothing, so a read can always name
 * every item the owner has not configured.
 */
export interface SalesPolicyValues extends Readonly<Record<string, unknown>> {
  readonly routineCadence: Readonly<Record<string, unknown>> | null;
  readonly responseTarget: Readonly<Record<string, unknown>> | null;
  readonly contactPolicy: Readonly<Record<string, unknown>> | null;
  readonly catalogueReference: Readonly<Record<string, unknown>> | null;
  readonly capacityLimits: Readonly<Record<string, unknown>> | null;
}

/** One installation's current operating policy, or the revision one configure request stored. */
export interface SalesPolicyRequest {
  readonly salesInstallationId: string;
  readonly requestId: string | null;
}

/** Read the observed readiness of one Sales installation. */
export interface SalesReadinessRequest {
  readonly salesInstallationId: string;
}

/** Read one opportunity by its Sales-owned identity. */
export interface SalesOpportunityRequest {
  readonly opportunityId: string;
}

/** Read one bounded live page of the current Sales pipeline. */
export interface SalesPipelineRequest {
  readonly scopeFingerprint: string;
  readonly statusFilter: ReadonlyArray<"open" | "won" | "lost"> | null;
  readonly after: { readonly lastOpportunityId: string } | null;
  readonly limit: number;
}

/** Read one command plan by its Sales-owned identity. */
export interface SalesCommandRequest {
  readonly commandId: string;
}

/** Read one decision request by its Sales-owned identity. */
export interface SalesDecisionRequestRequest {
  readonly decisionRequestId: string;
}

/** Read one Sales action by its Sales-owned identity. */
export interface SalesActionRequest {
  readonly actionId: string;
}

/** Read one Accounting handoff by its Sales-owned identity. */
export interface SalesHandoffRequest {
  readonly handoffId: string;
}

/** Record one complete operating-policy revision behind an expected-revision guard. */
export interface SalesConfigurePolicyRequest {
  readonly requestId: string;
  readonly salesInstallationId: string;
  readonly expectedPolicyRevision: string | number | null;
  readonly values: SalesPolicyValues;
}

/** Submit one revisioned and fingerprinted bounded Sales command plan. */
export interface SalesSubmitCommandRequest {
  readonly commandId: string;
  readonly commandRevision: number;
  readonly scope: SalesCommandScope;
  readonly requestedActions: ReadonlyArray<SalesRequestedAction>;
  readonly fingerprint: string;
  readonly expectedOpportunityRevisions: Readonly<Record<string, string | number>>;
}

/** Refine one awaiting-clarification command plan at its pending revision. */
export interface SalesClarifyCommandRequest {
  readonly commandId: string;
  readonly clarificationRevision: string | number;
  readonly permittedFact: SalesClarificationFact;
}

/** Answer one unchanged decision request at its exact proposal version and fingerprint. */
export interface SalesDecideProposalRequest {
  readonly decisionRequestId: string;
  readonly proposalVersion: number;
  readonly proposalFingerprint: string;
  readonly answer: "approve" | "reject";
  readonly expectedDecisionRevision: string | number;
}

/** Close or hold one opportunity using immutable evidence references. */
export interface SalesCloseRequest {
  readonly intentId: string;
  readonly opportunityId: string;
  readonly outcome: "won" | "lost" | "attention";
  readonly evidenceRefs: ReadonlyArray<string>;
  readonly confirmedOrder: Readonly<Record<string, unknown>> | null;
  readonly expectedRevision: string | number;
}

/** Prepare one confirmed-order handoff without contacting Accounting. */
export interface SalesPrepareHandoffRequest {
  readonly handoffId: string;
  readonly opportunityId: string;
  readonly orderRevision: number;
  readonly destinationAccountingInstallationId: string;
  readonly consentRef: string;
  readonly fingerprint: string;
  readonly expectedRevision: string | number;
}

/** Admit one prepared handoff into the Sales external-action queue. */
export interface SalesSubmitHandoffRequest {
  readonly handoffId: string;
  readonly confirmedOrderRevision: number;
  readonly fingerprint: string;
  readonly expectedHandoffRevision: string | number;
}

/** Allocate one successor action after authenticated no-start proof. */
export interface SalesRecoverActionRetryRequest {
  readonly operation: "retryNoStart";
  readonly actionId: string;
  readonly attemptGeneration: number;
  readonly receiverIntentId: string;
  readonly receiverAttemptId: string;
  readonly receiverNoStartProofRef: string;
  readonly oldWriterFence: SalesWriterFence;
  readonly fingerprint: string;
  readonly expectedRevision: string | number;
}

/** Stop one action whose no-start proof and worker fence are durable. */
export interface SalesRecoverActionStopRequest {
  readonly operation: "cancelNoStart";
  readonly actionId: string;
  readonly attemptGeneration: number;
  readonly noStartProof: Readonly<Record<string, unknown>>;
  readonly oldWriterFence: SalesWriterFence;
  readonly expectedRevision: string | number;
}

/** The two recovery doors `sales.recoverAction@1` opens: retry after proven no-start, or stop. */
export type SalesRecoverActionRequest = SalesRecoverActionRetryRequest | SalesRecoverActionStopRequest;

/** One disclosed operating-policy revision, with every unset item named. */
export interface SalesPolicyValue {
  readonly salesInstallationId: string;
  readonly revision: number;
  readonly requestId: string | null;
  readonly values: Readonly<Record<string, unknown>>;
  readonly unsetItems: ReadonlyArray<string>;
  readonly configuredBy: string | null;
  readonly recordedAt: string | null;
}

/** One observed installation readiness. */
export interface SalesReadinessValue {
  readonly salesInstallationId: string;
  readonly lifecycleIntentId: string;
  readonly configurationRevision: string;
  readonly setupAuthorityGeneration: number;
  readonly runtimeGeneration: string | null;
  readonly sourceRevision: string;
  readonly observedAt: string;
  readonly ready: boolean;
  readonly revision: number;
}

/** One opportunity's committed state. */
export interface SalesOpportunityValue {
  readonly opportunityId: string;
  readonly customerRef: string;
  readonly purpose: string;
  readonly status: string;
  readonly workState: string;
  readonly reason: string | null;
  readonly evidenceRefs: ReadonlyArray<string>;
  readonly revision: number;
  readonly closedAt: string | null;
}

/** One row of a bounded pipeline page. */
export interface SalesPipelineItem {
  readonly opportunityId: string;
  readonly customerRef: string;
  readonly purpose: string;
  readonly status: string;
  readonly workState: string;
  readonly revision: number;
}

/** One bounded live page of the current pipeline. */
export interface SalesPipelineValue {
  readonly observedAt: string;
  readonly scopeFingerprint: string;
  readonly items: ReadonlyArray<SalesPipelineItem>;
  readonly nextAfter: { readonly lastOpportunityId: string | null } | null;
  readonly livePagination: boolean;
}

/** One command plan's committed state. */
export interface SalesCommandValue {
  readonly commandId: string;
  readonly commandRevision: number;
  readonly status: string;
  readonly clarification: Readonly<Record<string, unknown>> | null;
  readonly actionIds: ReadonlyArray<string>;
  readonly revision: number;
}

/** One decision request's committed state. */
export interface SalesDecisionValue {
  readonly decisionRequestId: string;
  readonly opportunityId: string;
  readonly proposalVersion: number;
  readonly proposalFingerprint: string;
  readonly status: string;
  readonly revision: number;
}

/** One Sales action's stored state and whether a receiver receipt settled it. */
export interface SalesActionValue {
  readonly actionId: string;
  readonly attemptGeneration: number;
  readonly status: string;
  readonly receiverReceipt: Readonly<Record<string, unknown>> | null;
  readonly observationGap: boolean;
  readonly revision: number;
}

/** One Accounting handoff's sender-side state. */
export interface SalesHandoffValue {
  readonly handoffId: string;
  readonly status: string;
  readonly orderRevision: number;
  readonly actionId: string | null;
  readonly revision: number;
}

/** The one refusal code that means the proposed value set was invalid rather than unauthorized. */
const SALES_INVALID_VALUE_CODE = "SALES_POLICY_VALUE_INVALID";

/** The three statuses a refused Sales request answers with; anything else is not a refusal here. */
const SALES_REFUSAL_STATUSES: ReadonlySet<string> = new Set(["denied", "conflict", "unavailable"]);

/**
 * Every status a served Sales variant may carry; anything else fails closed.
 *
 * The receiver answers one closed shape, so the refusal is discriminated by its refusal CODE and not
 * by its status: `denied` is both the refusal status and the lifecycle status a readiness read echoes
 * as an observed fact, and only a result carrying a code is a refusal. An undeclared status is
 * neither, and fails closed rather than being read as a Sales state.
 */
const SALES_SERVED_STATUSES: ReadonlySet<string> = new Set([
  "completed",
  "duplicate",
  "applied",
  "denied",
  "pending",
  "outcome-unknown",
  "open",
  "won",
  "lost"
]);

/** A revision a failure may disclose: a positive safe integer, never a re-spelled string. */
const isDisclosedRevision = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0;

/** The one registered read a mutation is reconciled by; a query is reconciled by nothing. */
const reconcilesFor = (operation: SalesOperationName): SalesQueryName | null => SALES_RECONCILIATIONS[operation] ?? null;

/** The failure code one refusal reason is reported under. */
const refusalCodeFor = (reason: SalesRefusalReason): SalesRefusalCode => {
  if (reason === "DENIED") return "SALES_REFUSED_DENIED";
  if (reason === "INVALID") return "SALES_REFUSED_INVALID";
  if (reason === "CONFLICT") return "SALES_REFUSED_CONFLICT";
  return "SALES_REFUSED_UNAVAILABLE";
};

/** The one refusal reason a refused status and its receiver code name, or null when they name none. */
const refusalReasonOf = (status: string, code: string): SalesRefusalReason | null => {
  if (status === "denied") return code === SALES_INVALID_VALUE_CODE ? "INVALID" : "DENIED";
  if (status === "conflict") return "CONFLICT";
  return SALES_REFUSAL_STATUSES.has(status) ? "UNAVAILABLE" : null;
};

/** The positive revision a refusal disclosed, whether it named it `currentRevision` or `revision`. */
const disclosedRevision = (detail: Readonly<Record<string, unknown>> | null): number | null => {
  if (detail === null) return null;
  if (isDisclosedRevision(detail.currentRevision)) return detail.currentRevision;
  return isDisclosedRevision(detail.revision) ? detail.revision : null;
};

/** The non-empty item a refusal disclosed, or null when it named none. */
const disclosedItem = (detail: Readonly<Record<string, unknown>> | null): string | null =>
  detail !== null && typeof detail.item === "string" && detail.item.length > 0 ? detail.item : null;

const failure = (operation: SalesOperationName, code: string, reason: string | null, requestId: string | null): SalesFailure =>
  failedWith(routeFailureKind(code), { code, reason: reason ?? "" }, { operation, requestId, reconciles: reconcilesFor(operation), refusal: null });

/** Keep the receiver's own disclosure: the refusal reason, and the item or revision it named. */
const salesRefusal = (reason: SalesRefusalReason, code: string, value: unknown): SalesRefusal => {
  const detail = isClosedRecord(value) ? value : null;
  return { reason, code, item: disclosedItem(detail), currentRevision: disclosedRevision(detail) };
};

/** One refused result, or the failure its own status and code are not a refusal under. */
const narrowSalesRefusal = (operation: SalesOperationName, requestId: string, status: string, code: unknown, value: unknown): SalesFailure => {
  if (typeof code !== "string" || code.length === 0) return failure(operation, "MALFORMED_ANSWER", "The refused result carries no refusal code.", requestId);
  const reason = refusalReasonOf(status, code);
  if (reason === null) return failure(operation, "UNEXPECTED_RESULT_STATUS", `The receiver refused with the undeclared status ${status}.`, requestId);
  return { ...failure(operation, refusalCodeFor(reason), null, requestId), refusal: salesRefusal(reason, code, value) };
};

/** One served variant, or the failure its own status or missing value is a variant under. */
const narrowSalesServed = <TValue,>(operation: SalesOperationName, requestId: string, status: string, value: unknown): SalesAnswer<TValue> => {
  if (!SALES_SERVED_STATUSES.has(status)) return failure(operation, "UNEXPECTED_RESULT_STATUS", `The receiver answered the undeclared status ${status}.`, requestId);
  if (!isClosedRecord(value)) return failure(operation, "MALFORMED_ANSWER", "The served variant carries no value object.", requestId);
  // The receiver's field-level closure is its own guarantee, so the value enters as the variant type
  // the caller asked for: there is no second shape here for a cast to erase.
  return { ok: true, data: value as TValue };
};

/**
 * Narrow the receiver's own closed result.
 *
 * The receiver answers ONE shape - a status, the refusal's own code when it refused, and the value it
 * settled on - so the discriminator is that code: a result that carries one is a refusal, and its
 * status has to be one of the three refusal statuses; a result without one is a served variant, and
 * its status has to be one of the eight the receiver's own surface declares. A status outside both
 * sets fails closed rather than being read as a Sales state, and `sales_refusal` keeps the reason the
 * contract registers plus whatever the receiver disclosed beside it.
 */
const narrowSalesResult = <TValue,>(operation: SalesOperationName, requestId: string, result: unknown): SalesAnswer<TValue> => {
  if (!isClosedRecord(result)) return failure(operation, "MALFORMED_ANSWER", "The served result is not a result object.", requestId);
  const status = result.status;
  if (typeof status !== "string" || status.length === 0) return failure(operation, "MALFORMED_ANSWER", "The served result carries no status.", requestId);
  if (result.code !== undefined) return narrowSalesRefusal(operation, requestId, status, result.code, result.value);
  return narrowSalesServed<TValue>(operation, requestId, status, result.value);
};

/** One served Sales result, accepted only under this call's own echoed identity. */
const narrowSalesEnvelope = <TValue,>(operation: SalesOperationName, requestId: string, body: Readonly<Record<string, unknown>>): SalesAnswer<TValue> => {
  if (body.operation !== operation) return failure(operation, "ECHOED_IDENTITY_MISMATCH", "The result echoes another operation name.", requestId);
  if (body.requestId !== requestId) return failure(operation, "ECHOED_IDENTITY_MISMATCH", "The result echoes another stable identity.", requestId);
  return narrowSalesResult<TValue>(operation, requestId, body.result);
};

/** One outcome nobody can attest, accepted only under this call's own echoed identity. */
const narrowUnknownOutcome = (operation: SalesOperationName, requestId: string, body: Readonly<Record<string, unknown>>): SalesFailure =>
  body.operation === operation && body.requestId === requestId
    ? failure(operation, "outcome_unknown", null, requestId)
    : failure(operation, "ECHOED_IDENTITY_MISMATCH", "The unknown outcome echoes an identity this call did not send.", requestId);

/** Narrow the route's own closed reply, keeping every non-served outcome a refusal. */
const narrowSalesAnswer = <TValue,>(operation: SalesOperationName, requestId: string, body: unknown): SalesAnswer<TValue> => {
  if (!isClosedRecord(body)) return failure(operation, "MALFORMED_ANSWER", "The route answer is not an envelope object.", requestId);
  if (body.kind === "outcome_unknown") return narrowUnknownOutcome(operation, requestId, body);
  if (body.kind === "sales_result") return narrowSalesEnvelope<TValue>(operation, requestId, body);
  if (body.kind === "accounting_result") return failure(operation, "UNEXPECTED_RESULT_KIND", "The route answered the Accounting result kind for a Sales operation.", requestId);
  if (isRouteErrorName(body.kind)) return failure(operation, body.kind, typeof body.reason === "string" ? body.reason : null, requestId);
  return failure(operation, "UNEXPECTED_RESULT_KIND", `The route answered the undeclared result kind ${String(body.kind)}.`, requestId);
};

/** Build the one address of one registered operation. */
export const salesOperationAddress = (scope: SalesInstallationScope, operation: SalesOperationName): string => operationAddress(scope, operation);

/**
 * Send exactly one Sales operation request, and nothing else.
 *
 * One call is one request: no loop, no timer and no re-send. The caller replays the SAME stable
 * identity if it decides to try again, which is what keeps a replay one intent.
 */
const sendSalesOperation = async <TValue,>(
  accessToken: string | null,
  scope: SalesInstallationScope,
  operation: SalesOperationName,
  request: Readonly<Record<string, unknown>>,
  requestId: string
): Promise<SalesAnswer<TValue>> => {
  const exchange = await sendOperation(accessToken, salesOperationAddress(scope, operation), requestId, request);
  if (!exchange.arrived) return failure(operation, exchange.code, exchange.reason, exchange.requestId);
  return narrowSalesAnswer<TValue>(operation, requestId, exchange.body);
};

/** Read one installation's operating policy, or the revision one configure request stored. */
export const readSalesPolicy = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesPolicyRequest, requestId: string): Promise<SalesAnswer<SalesPolicyValue>> =>
  sendSalesOperation<SalesPolicyValue>(accessToken, scope, "sales.policy@1", { operation: "policy", ...request }, requestId);

/** Read one installation's observed readiness. */
export const readSalesReadiness = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesReadinessRequest, requestId: string): Promise<SalesAnswer<SalesReadinessValue>> =>
  sendSalesOperation<SalesReadinessValue>(accessToken, scope, "sales.readiness@1", { operation: "readiness", ...request }, requestId);

/** Read one opportunity's committed state, the read a close is reconciled by. */
export const readSalesOpportunity = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesOpportunityRequest, requestId: string): Promise<SalesAnswer<SalesOpportunityValue>> =>
  sendSalesOperation<SalesOpportunityValue>(accessToken, scope, "sales.opportunity@1", { operation: "opportunity", ...request }, requestId);

/** Read one bounded live page of the current pipeline. */
export const readSalesPipeline = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesPipelineRequest, requestId: string): Promise<SalesAnswer<SalesPipelineValue>> =>
  sendSalesOperation<SalesPipelineValue>(accessToken, scope, "sales.pipeline@1", { operation: "pipeline", ...request }, requestId);

/** Read one command plan's committed state, the read a command and its clarification are reconciled by. */
export const readSalesCommand = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesCommandRequest, requestId: string): Promise<SalesAnswer<SalesCommandValue>> =>
  sendSalesOperation<SalesCommandValue>(accessToken, scope, "sales.command@1", { operation: "command", ...request }, requestId);

/** Read one decision request's committed state, the read a decision is reconciled by. */
export const readSalesDecisionRequest = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesDecisionRequestRequest, requestId: string): Promise<SalesAnswer<SalesDecisionValue>> =>
  sendSalesOperation<SalesDecisionValue>(accessToken, scope, "sales.decisionRequest@1", { operation: "decisionRequest", ...request }, requestId);

/** Read one Sales action's stored state, the read any recovery attempt is reconciled by. */
export const readSalesAction = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesActionRequest, requestId: string): Promise<SalesAnswer<SalesActionValue>> =>
  sendSalesOperation<SalesActionValue>(accessToken, scope, "sales.action@1", { operation: "action", ...request }, requestId);

/** Read one Accounting handoff's sender-side state, the read a handoff is reconciled by. */
export const readSalesHandoff = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesHandoffRequest, requestId: string): Promise<SalesAnswer<SalesHandoffValue>> =>
  sendSalesOperation<SalesHandoffValue>(accessToken, scope, "sales.handoff@1", { operation: "handoff", ...request }, requestId);

/** Record one complete operating-policy revision; an exact replay returns the revision it stored. */
export const commandSalesConfigurePolicy = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesConfigurePolicyRequest, requestId: string): Promise<SalesAnswer<SalesPolicyValue>> =>
  sendSalesOperation<SalesPolicyValue>(accessToken, scope, "sales.configurePolicy@1", { operation: "configurePolicy", ...request }, requestId);

/** Submit one bounded command plan under its own command identity and fingerprint. */
export const commandSalesSubmitCommand = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesSubmitCommandRequest, requestId: string): Promise<SalesAnswer<SalesCommandValue>> =>
  sendSalesOperation<SalesCommandValue>(accessToken, scope, "sales.submitCommand@1", { operation: "executeCommand", ...request }, requestId);

/** Refine one awaiting-clarification command plan, admitted under its own pending revision. */
export const commandSalesClarifyCommand = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesClarifyCommandRequest, requestId: string): Promise<SalesAnswer<SalesCommandValue>> =>
  sendSalesOperation<SalesCommandValue>(accessToken, scope, "sales.clarifyCommand@1", { operation: "clarifyCommand", ...request }, requestId);

/** Answer one immutable proposal once, against its exact version and fingerprint. */
export const commandSalesDecideProposal = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesDecideProposalRequest, requestId: string): Promise<SalesAnswer<SalesDecisionValue>> =>
  sendSalesOperation<SalesDecisionValue>(accessToken, scope, "sales.decideProposal@1", { operation: "answerDecision", ...request }, requestId);

/** Close or hold one opportunity at its expected revision, reporting the committed status. */
export const commandSalesClose = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesCloseRequest, requestId: string): Promise<SalesAnswer<SalesOpportunityValue>> =>
  sendSalesOperation<SalesOpportunityValue>(accessToken, scope, "sales.close@1", { operation: "close", ...request }, requestId);

/** Prepare one confirmed-order handoff without contacting Accounting. */
export const commandSalesPrepareHandoff = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesPrepareHandoffRequest, requestId: string): Promise<SalesAnswer<SalesHandoffValue>> =>
  sendSalesOperation<SalesHandoffValue>(accessToken, scope, "sales.prepareHandoff@1", { operation: "prepareHandoff", ...request }, requestId);

/** Admit one prepared handoff into the Sales external-action queue. */
export const commandSalesSubmitHandoff = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesSubmitHandoffRequest, requestId: string): Promise<SalesAnswer<SalesHandoffValue>> =>
  sendSalesOperation<SalesHandoffValue>(accessToken, scope, "sales.submitHandoff@1", { operation: "submitPreparedHandoff", ...request }, requestId);

/** Retry after proven no-start, or stop: the one registered name that opens two recovery doors. */
export const commandSalesRecoverAction = async (accessToken: string | null, scope: SalesInstallationScope, request: SalesRecoverActionRequest, requestId: string): Promise<SalesAnswer<SalesActionValue>> =>
  sendSalesOperation<SalesActionValue>(accessToken, scope, "sales.recoverAction@1", { ...request }, requestId);