import { type Failure, type Outcome } from "@nivo/api"
import type { InstallationScope } from "../operation-route"

/** Where one Sales installation lives: the three coordinates the route authenticates the caller to. */
export type SalesInstallationScope = InstallationScope

/** The eight registered Sales queries. */
export type SalesQueryName =
    | "sales.policy@1"
    | "sales.readiness@1"
    | "sales.opportunity@1"
    | "sales.pipeline@1"
    | "sales.command@1"
    | "sales.decisionRequest@1"
    | "sales.action@1"
    | "sales.handoff@1"

/** The eight registered Sales mutations. */
export type SalesMutationName =
    | "sales.configurePolicy@1"
    | "sales.submitCommand@1"
    | "sales.clarifyCommand@1"
    | "sales.decideProposal@1"
    | "sales.close@1"
    | "sales.prepareHandoff@1"
    | "sales.submitHandoff@1"
    | "sales.recoverAction@1"

/** The closed registered set of sixteen operations. */
export type SalesOperationName = SalesQueryName | SalesMutationName

/** The registered queries, in contract order. */
export const SALES_QUERY_NAMES: ReadonlyArray<SalesQueryName> = [
    "sales.policy@1",
    "sales.readiness@1",
    "sales.opportunity@1",
    "sales.pipeline@1",
    "sales.command@1",
    "sales.decisionRequest@1",
    "sales.action@1",
    "sales.handoff@1",
]

/** The registered mutations, in contract order. */
export const SALES_MUTATION_NAMES: ReadonlyArray<SalesMutationName> = [
    "sales.configurePolicy@1",
    "sales.submitCommand@1",
    "sales.clarifyCommand@1",
    "sales.decideProposal@1",
    "sales.close@1",
    "sales.prepareHandoff@1",
    "sales.submitHandoff@1",
    "sales.recoverAction@1",
]

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
    "sales.recoverAction@1": "sales.action@1",
}

/** The closed refusal reasons of contract.sales.public-operations. */
export type SalesRefusalReason = "DENIED" | "INVALID" | "CONFLICT" | "UNAVAILABLE"

/** One Sales refusal: its reason, the receiver's finer code, and whatever the receiver disclosed. */
export interface SalesRefusal {
    readonly reason: SalesRefusalReason
    readonly code: string
    readonly item: string | null
    readonly currentRevision: number | null
}

/** The failure code of one refusal; each reason is its own typed failure. */
export type SalesRefusalCode =
    "SALES_REFUSED_DENIED" | "SALES_REFUSED_INVALID" | "SALES_REFUSED_CONFLICT" | "SALES_REFUSED_UNAVAILABLE"

/**
 * What one failed Sales answer adds to the common failure fields.
 *
 * The `code` is one of the route's closed error names, one of `outcome_unknown` and
 * `DEADLINE_EXCEEDED` (the effect is unattested), one of the four `SALES_REFUSED_*` codes, or a
 * transport condition (`UNAUTHENTICATED`, `UNREACHABLE`, `MALFORMED_ANSWER`,
 * `UNEXPECTED_RESULT_KIND`, `UNEXPECTED_RESULT_STATUS`, `ECHOED_IDENTITY_MISMATCH`).
 */
export type SalesFailureDetail = {
    readonly operation: SalesOperationName
    readonly requestId: string | null
    readonly reconciles: SalesQueryName | null
    readonly refusal: SalesRefusal | null
}

/** One answer this client refuses to report as a served Sales variant. */
export type SalesFailure = Failure<SalesFailureDetail>

/** One Sales answer: the operation's own variant value, or a failure that names why it is unresolved. */
export type SalesAnswer<TValue> = Outcome<TValue, SalesFailureDetail>

/** One requested command action of the bounded Sales planner. */
export type SalesRequestedAction = "qualify" | "contact" | "request-decision" | "prepare-handoff" | "close"

/** The closed object selectors one Sales command plan names. */
export interface SalesCommandScope {
    readonly customerRefs: ReadonlyArray<string>
    readonly opportunityIds: ReadonlyArray<string>
    readonly offerRefs: ReadonlyArray<string>
}

/** The one permitted fact that resolves a pending command clarification. */
export type SalesClarificationFact = { readonly customerRef: string } | { readonly opportunityId: string }

/** A durable server-established worker fence. */
export interface SalesWriterFence {
    readonly claimTokenHash: string
    readonly fencedAt: string
}

/**
 * The complete proposed engagement-operating-policy value set.
 *
 * A null member records no value for that item: Sales defaults nothing, so a read can always name
 * every item the owner has not configured.
 */
export interface SalesPolicyValues extends Readonly<Record<string, unknown>> {
    readonly routineCadence: Readonly<Record<string, unknown>> | null
    readonly responseTarget: Readonly<Record<string, unknown>> | null
    readonly contactPolicy: Readonly<Record<string, unknown>> | null
    readonly catalogueReference: Readonly<Record<string, unknown>> | null
    readonly capacityLimits: Readonly<Record<string, unknown>> | null
}

/** One installation's current operating policy, or the revision one configure request stored. */
export interface SalesPolicyRequest {
    readonly salesInstallationId: string
    readonly requestId: string | null
}

/** Read the observed readiness of one Sales installation. */
export interface SalesReadinessRequest {
    readonly salesInstallationId: string
}

/** Read one opportunity by its Sales-owned identity. */
export interface SalesOpportunityRequest {
    readonly opportunityId: string
}

/** Read one bounded live page of the current Sales pipeline. */
export interface SalesPipelineRequest {
    readonly scopeFingerprint: string
    readonly statusFilter: ReadonlyArray<"open" | "won" | "lost"> | null
    readonly after: { readonly lastOpportunityId: string } | null
    readonly limit: number
}

/** Read one command plan by its Sales-owned identity. */
export interface SalesCommandRequest {
    readonly commandId: string
}

/** Read one decision request by its Sales-owned identity. */
export interface SalesDecisionRequestRequest {
    readonly decisionRequestId: string
}

/** Read one Sales action by its Sales-owned identity. */
export interface SalesActionRequest {
    readonly actionId: string
}

/** Read one Accounting handoff by its Sales-owned identity. */
export interface SalesHandoffRequest {
    readonly handoffId: string
}

/** Record one complete operating-policy revision behind an expected-revision guard. */
export interface SalesConfigurePolicyRequest {
    readonly requestId: string
    readonly salesInstallationId: string
    readonly expectedPolicyRevision: string | number | null
    readonly values: SalesPolicyValues
}

/** Submit one revisioned and fingerprinted bounded Sales command plan. */
export interface SalesSubmitCommandRequest {
    readonly commandId: string
    readonly commandRevision: number
    readonly scope: SalesCommandScope
    readonly requestedActions: ReadonlyArray<SalesRequestedAction>
    readonly fingerprint: string
    readonly expectedOpportunityRevisions: Readonly<Record<string, string | number>>
}

/** Refine one awaiting-clarification command plan at its pending revision. */
export interface SalesClarifyCommandRequest {
    readonly commandId: string
    readonly clarificationRevision: string | number
    readonly permittedFact: SalesClarificationFact
}

/** Answer one unchanged decision request at its exact proposal version and fingerprint. */
export interface SalesDecideProposalRequest {
    readonly decisionRequestId: string
    readonly proposalVersion: number
    readonly proposalFingerprint: string
    readonly answer: "approve" | "reject"
    readonly expectedDecisionRevision: string | number
}

/** Close or hold one opportunity using immutable evidence references. */
export interface SalesCloseRequest {
    readonly intentId: string
    readonly opportunityId: string
    readonly outcome: "won" | "lost" | "attention"
    readonly evidenceRefs: ReadonlyArray<string>
    readonly confirmedOrder: Readonly<Record<string, unknown>> | null
    readonly expectedRevision: string | number
}

/** Prepare one confirmed-order handoff without contacting Accounting. */
export interface SalesPrepareHandoffRequest {
    readonly handoffId: string
    readonly opportunityId: string
    readonly orderRevision: number
    readonly destinationAccountingInstallationId: string
    readonly consentRef: string
    readonly fingerprint: string
    readonly expectedRevision: string | number
}

/** Admit one prepared handoff into the Sales external-action queue. */
export interface SalesSubmitHandoffRequest {
    readonly handoffId: string
    readonly confirmedOrderRevision: number
    readonly fingerprint: string
    readonly expectedHandoffRevision: string | number
}

/** Allocate one successor action after authenticated no-start proof. */
export interface SalesRecoverActionRetryRequest {
    readonly operation: "retryNoStart"
    readonly actionId: string
    readonly attemptGeneration: number
    readonly receiverIntentId: string
    readonly receiverAttemptId: string
    readonly receiverNoStartProofRef: string
    readonly oldWriterFence: SalesWriterFence
    readonly fingerprint: string
    readonly expectedRevision: string | number
}

/** Stop one action whose no-start proof and worker fence are durable. */
export interface SalesRecoverActionStopRequest {
    readonly operation: "cancelNoStart"
    readonly actionId: string
    readonly attemptGeneration: number
    readonly noStartProof: Readonly<Record<string, unknown>>
    readonly oldWriterFence: SalesWriterFence
    readonly expectedRevision: string | number
}

/** The two recovery doors `sales.recoverAction@1` opens: retry after proven no-start, or stop. */
export type SalesRecoverActionRequest = SalesRecoverActionRetryRequest | SalesRecoverActionStopRequest

/** One disclosed operating-policy revision, with every unset item named. */
export interface SalesPolicyValue {
    readonly salesInstallationId: string
    readonly revision: number
    readonly requestId: string | null
    readonly values: Readonly<Record<string, unknown>>
    readonly unsetItems: ReadonlyArray<string>
    readonly configuredBy: string | null
    readonly recordedAt: string | null
}

/** One observed installation readiness. */
export interface SalesReadinessValue {
    readonly salesInstallationId: string
    readonly lifecycleIntentId: string
    readonly configurationRevision: string
    readonly setupAuthorityGeneration: number
    readonly runtimeGeneration: string | null
    readonly sourceRevision: string
    readonly observedAt: string
    readonly ready: boolean
    readonly revision: number
}

/** One opportunity's committed state. */
export interface SalesOpportunityValue {
    readonly opportunityId: string
    readonly customerRef: string
    readonly purpose: string
    readonly status: string
    readonly workState: string
    readonly reason: string | null
    readonly evidenceRefs: ReadonlyArray<string>
    readonly revision: number
    readonly closedAt: string | null
}

/** One row of a bounded pipeline page. */
export interface SalesPipelineItem {
    readonly opportunityId: string
    readonly customerRef: string
    readonly purpose: string
    readonly status: string
    readonly workState: string
    readonly revision: number
}

/** One bounded live page of the current pipeline. */
export interface SalesPipelineValue {
    readonly observedAt: string
    readonly scopeFingerprint: string
    readonly items: ReadonlyArray<SalesPipelineItem>
    readonly nextAfter: { readonly lastOpportunityId: string | null } | null
    readonly livePagination: boolean
}

/** One command plan's committed state. */
export interface SalesCommandValue {
    readonly commandId: string
    readonly commandRevision: number
    readonly status: string
    readonly clarification: Readonly<Record<string, unknown>> | null
    readonly actionIds: ReadonlyArray<string>
    readonly revision: number
}

/** One decision request's committed state. */
export interface SalesDecisionValue {
    readonly decisionRequestId: string
    readonly opportunityId: string
    readonly proposalVersion: number
    readonly proposalFingerprint: string
    readonly status: string
    readonly revision: number
}

/** One Sales action's stored state and whether a receiver receipt settled it. */
export interface SalesActionValue {
    readonly actionId: string
    readonly attemptGeneration: number
    readonly status: string
    readonly receiverReceipt: Readonly<Record<string, unknown>> | null
    readonly observationGap: boolean
    readonly revision: number
}

/** One Accounting handoff's sender-side state. */
export interface SalesHandoffValue {
    readonly handoffId: string
    readonly status: string
    readonly orderRevision: number
    readonly actionId: string | null
    readonly revision: number
}

