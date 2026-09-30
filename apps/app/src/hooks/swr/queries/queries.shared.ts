import { type AccountingEvidenceInput, type AccountingInstallationScope, type AccountingResultDetailInput, type AccountingRoutineResultInput, type AccountingSummaryQueryInput } from "@/modules/api/accounting"
import { type NivoQueryKey } from "../swr.shared"
import { type WorkspaceCheckoutEntryRequest } from "@/modules/api/workspace-controlplane"
import { type SalesActionRequest, type SalesInstallationScope, type SalesCommandRequest, type SalesDecisionRequestRequest, type SalesHandoffRequest, type SalesOpportunityRequest, type SalesPipelineRequest, type SalesPolicyRequest, type SalesReadinessRequest } from "@/modules/api/sales"

/* One hook per file, one registered read per hook. */

/** Cache identity for one evidence identity inside one installation. */
export const accountingEvidenceQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingEvidenceInput,
): NivoQueryKey => [
    "accounting",
    "evidence",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.evidenceId,
]

/* One hook per file, one registered read per hook. */

/** Cache identity for one current or historical result detail inside one installation. */
export const accountingResultDetailQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingResultDetailInput,
): NivoQueryKey => [
    "accounting",
    "result-detail",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.action,
    input.action === "current" ? input.resultId : input.itemId,
    input.action === "current" ? "current" : input.asOf,
]

/* One hook per file, one registered read per hook. */

/** Cache identity for one routine intent inside one installation. */
export const accountingRoutineResultQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingRoutineResultInput,
): NivoQueryKey => [
    "accounting",
    "routine-result",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.intentId,
]

/* One hook per file, one registered read per hook. */

/** Cache identity for one summary page inside one installation. */
export const accountingSummaryQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingSummaryQueryInput,
): NivoQueryKey => [
    "accounting",
    "summary",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.periodStart,
    input.periodEndExclusive,
    input.currency ?? "all-currencies",
    input.pageSize,
    input.cursor ?? "first-page",
]

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

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The entry key carries the
 * purchase and the workspace the read claims, so a read of one workspace never answers another's.
 */

/** Cache identity of one entry resolution: the purchase and the workspace the caller claims ready. */
export const workspaceCheckoutEntryQueryKey = (request: WorkspaceCheckoutEntryRequest): NivoQueryKey => [
    "workspace-checkout",
    "entry",
    request.purchaseId,
    request.workspaceId,
]

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The offer-identity key is a
 * function rather than a module constant so it stays out of the frozen-value shape the same rule checks.
 */

/** Cache identity of one offer selection: the exact offer identity and version the screen presents. */
export const workspaceCheckoutOffersQueryKey = (offerId: string, offerVersion: string): NivoQueryKey => [
    "workspace-checkout",
    "offers",
    offerId,
    offerVersion,
]

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The purchase-identity key is
 * exported so the two command hooks of this seam can refresh exactly the read they moved.
 */

/** Cache identity of one purchase's composed status read. */
export const workspaceCheckoutStatusQueryKey = (purchaseId: string): NivoQueryKey => [
    "workspace-checkout",
    "status",
    purchaseId,
]
