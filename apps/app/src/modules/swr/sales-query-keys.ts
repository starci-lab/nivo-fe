import type {
    SalesActionRequest,
    SalesInstallationScope,
    SalesCommandRequest,
    SalesDecisionRequestRequest,
    SalesHandoffRequest,
    SalesOpportunityRequest,
    SalesPipelineRequest,
    SalesPolicyRequest,
    SalesReadinessRequest,
} from "@/modules/api/sales"
import type { NivoQueryKey } from "@/modules/swr/query-key-types"

/** Exact workspace/module controller identity required by support projections. */
export type SupportQueryIdentity = {
    readonly hostname: string | null
    readonly workspaceId: string
    readonly installationId: string
    readonly enabled: boolean
}

/** Cache identity for the complete state of one installed Chatbot. */
export const chatbotWorkbenchQueryKey = (identity: SupportQueryIdentity) =>
    ["chatbot", "workbench", identity.hostname, identity.workspaceId, identity.installationId] as const

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read every recovery
 * attempt is reconciled by, and the read that discloses the no-start proof state a retry needs.
 */

/** Cache identity for one Sales action inside one installation. */
export const salesActionQueryKey = (scope: SalesInstallationScope, input: SalesActionRequest): NivoQueryKey => [
    "sales",
    "action",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.actionId,
]

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a submitted or
 * clarified command plan is reconciled by - by its own command identity, never by a new one.
 */

/** Cache identity for one command plan inside one installation. */
export const salesCommandQueryKey = (scope: SalesInstallationScope, input: SalesCommandRequest): NivoQueryKey => [
    "sales",
    "command",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.commandId,
]

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a decision answer
 * is reconciled by, so an answered proposal is settled from its own committed state.
 */

/** Cache identity for one decision request inside one installation. */
export const salesDecisionRequestQueryKey = (
    scope: SalesInstallationScope,
    input: SalesDecisionRequestRequest,
): NivoQueryKey => [
    "sales",
    "decision-request",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.decisionRequestId,
]

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a prepared or
 * submitted handoff is reconciled by, and it discloses only the sender's own state - the Accounting
 * intake receipt is Accounting's to disclose.
 */

/** Cache identity for one Accounting handoff inside one installation. */
export const salesHandoffQueryKey = (scope: SalesInstallationScope, input: SalesHandoffRequest): NivoQueryKey => [
    "sales",
    "handoff",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.handoffId,
]

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a close is
 * reconciled by, and a close's own identity never enters it: the read names the opportunity it
 * observes.
 */

/** Cache identity for one opportunity inside one installation. */
export const salesOpportunityQueryKey = (
    scope: SalesInstallationScope,
    input: SalesOpportunityRequest,
): NivoQueryKey => [
    "sales",
    "opportunity",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.opportunityId,
]

const SALES_STATUS_ORDER: ReadonlyArray<"open" | "won" | "lost"> = ["open", "won", "lost"]

/** Canonicalize a pipeline filter into the Sales status vocabulary's declared order. */
const salesStatusFilterSegment = (statusFilter: SalesPipelineRequest["statusFilter"]): string =>
    statusFilter === null || statusFilter.length === 0
        ? "all-statuses"
        : SALES_STATUS_ORDER.filter((status) => statusFilter.includes(status)).join("+")

/** Cache identity for one pipeline page inside one installation. */
export const salesPipelineQueryKey = (scope: SalesInstallationScope, input: SalesPipelineRequest): NivoQueryKey => [
    "sales",
    "pipeline",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.scopeFingerprint,
    salesStatusFilterSegment(input.statusFilter),
    input.after?.lastOpportunityId ?? "first-page",
    input.limit,
]

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes.
 */

/** Cache identity for one installation's policy revision, current or the one a configure request stored. */
export const salesPolicyQueryKey = (scope: SalesInstallationScope, input: SalesPolicyRequest): NivoQueryKey => [
    "sales",
    "policy",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.requestId ?? "current-revision",
]

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes.
 */

/** Cache identity for one installation's observed readiness. */
export const salesReadinessQueryKey = (scope: SalesInstallationScope, input: SalesReadinessRequest): NivoQueryKey => [
    "sales",
    "readiness",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.salesInstallationId,
]

