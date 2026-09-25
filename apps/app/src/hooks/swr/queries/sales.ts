"use client";

import {
  readSalesAction,
  readSalesCommand,
  readSalesDecisionRequest,
  readSalesHandoff,
  readSalesOpportunity,
  readSalesPipeline,
  readSalesPolicy,
  readSalesReadiness,
  type SalesActionRequest,
  type SalesCommandRequest,
  type SalesDecisionRequestRequest,
  type SalesHandoffRequest,
  type SalesInstallationScope,
  type SalesOpportunityRequest,
  type SalesPipelineRequest,
  type SalesPolicyRequest,
  type SalesReadinessRequest
} from "@/modules/api/sales";
import { useSession } from "@/modules/auth/session";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * THE INSTALLATION-SCOPED SALES READS.
 *
 * Each read below is one POST to its registered operation address through the client, cached under a
 * key made only of the installation coordinates and the read's own selector - so two installations,
 * or two selectors, can never share an entry.
 *
 * A read's stable identity is derived from that same key: it is the identity the route echoes, so a
 * re-read of one selector is one identity rather than a new one each render, and a read that
 * reconciles a mutation can carry that mutation's own identity.
 */

/** The signed-in access token, or null when no session holds one. */
const useSalesAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** The stable identity one Sales read is addressed by: its registered name and its own selector. */
const salesReadIdentity = (operation: string, ...parts: ReadonlyArray<string | null>): string => `${operation}/${parts.map(part => part ?? "-").join("/")}`;

/** Cache identity for one installation's policy revision, current or the one a configure request stored. */
export const salesPolicyQueryKey = (scope: SalesInstallationScope, input: SalesPolicyRequest): NivoQueryKey => ["sales", "policy", scope.workspaceId, scope.instanceId, scope.installationId, input.requestId ?? "current-revision"];

/** Cache identity for one installation's observed readiness. */
export const salesReadinessQueryKey = (scope: SalesInstallationScope, input: SalesReadinessRequest): NivoQueryKey => ["sales", "readiness", scope.workspaceId, scope.instanceId, scope.installationId, input.salesInstallationId];

/** Cache identity for one opportunity inside one installation. */
export const salesOpportunityQueryKey = (scope: SalesInstallationScope, input: SalesOpportunityRequest): NivoQueryKey => ["sales", "opportunity", scope.workspaceId, scope.instanceId, scope.installationId, input.opportunityId];

/** Cache identity for one pipeline page inside one installation. */
export const salesPipelineQueryKey = (scope: SalesInstallationScope, input: SalesPipelineRequest): NivoQueryKey => ["sales", "pipeline", scope.workspaceId, scope.instanceId, scope.installationId, input.scopeFingerprint, input.statusFilter === null || input.statusFilter.length === 0 ? "all-statuses" : [...input.statusFilter].sort().join("+"), input.after?.lastOpportunityId ?? "first-page", input.limit];

/** Cache identity for one command plan inside one installation. */
export const salesCommandQueryKey = (scope: SalesInstallationScope, input: SalesCommandRequest): NivoQueryKey => ["sales", "command", scope.workspaceId, scope.instanceId, scope.installationId, input.commandId];

/** Cache identity for one decision request inside one installation. */
export const salesDecisionRequestQueryKey = (scope: SalesInstallationScope, input: SalesDecisionRequestRequest): NivoQueryKey => ["sales", "decision-request", scope.workspaceId, scope.instanceId, scope.installationId, input.decisionRequestId];

/** Cache identity for one Sales action inside one installation. */
export const salesActionQueryKey = (scope: SalesInstallationScope, input: SalesActionRequest): NivoQueryKey => ["sales", "action", scope.workspaceId, scope.instanceId, scope.installationId, input.actionId];

/** Cache identity for one Accounting handoff inside one installation. */
export const salesHandoffQueryKey = (scope: SalesInstallationScope, input: SalesHandoffRequest): NivoQueryKey => ["sales", "handoff", scope.workspaceId, scope.instanceId, scope.installationId, input.handoffId];

/** Read one installation's operating policy, or the revision one configure request stored. */
export const useQuerySalesPolicySwr = (scope: SalesInstallationScope, input: SalesPolicyRequest) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(accessToken === null ? null : salesPolicyQueryKey(scope, input), () => readSalesPolicy(accessToken, scope, input, salesReadIdentity("sales.policy@1", scope.installationId, input.requestId)));
};

/** Read one installation's observed readiness. */
export const useQuerySalesReadinessSwr = (scope: SalesInstallationScope, input: SalesReadinessRequest) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(accessToken === null ? null : salesReadinessQueryKey(scope, input), () => readSalesReadiness(accessToken, scope, input, salesReadIdentity("sales.readiness@1", scope.installationId, input.salesInstallationId)));
};

/** Read one opportunity's committed state. */
export const useQuerySalesOpportunitySwr = (scope: SalesInstallationScope, input: SalesOpportunityRequest) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(accessToken === null ? null : salesOpportunityQueryKey(scope, input), () => readSalesOpportunity(accessToken, scope, input, salesReadIdentity("sales.opportunity@1", scope.installationId, input.opportunityId)));
};

/** Read one bounded live page of the current pipeline. */
export const useQuerySalesPipelineSwr = (scope: SalesInstallationScope, input: SalesPipelineRequest) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(accessToken === null ? null : salesPipelineQueryKey(scope, input), () => readSalesPipeline(accessToken, scope, input, salesReadIdentity("sales.pipeline@1", scope.installationId, input.scopeFingerprint, input.after?.lastOpportunityId ?? null)));
};

/** Read one command plan's committed state. */
export const useQuerySalesCommandSwr = (scope: SalesInstallationScope, input: SalesCommandRequest) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(accessToken === null ? null : salesCommandQueryKey(scope, input), () => readSalesCommand(accessToken, scope, input, salesReadIdentity("sales.command@1", scope.installationId, input.commandId)));
};

/** Read one decision request's committed state. */
export const useQuerySalesDecisionRequestSwr = (scope: SalesInstallationScope, input: SalesDecisionRequestRequest) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(accessToken === null ? null : salesDecisionRequestQueryKey(scope, input), () => readSalesDecisionRequest(accessToken, scope, input, salesReadIdentity("sales.decisionRequest@1", scope.installationId, input.decisionRequestId)));
};

/** Read one Sales action's stored state. */
export const useQuerySalesActionSwr = (scope: SalesInstallationScope, input: SalesActionRequest) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(accessToken === null ? null : salesActionQueryKey(scope, input), () => readSalesAction(accessToken, scope, input, salesReadIdentity("sales.action@1", scope.installationId, input.actionId)));
};

/** Read one Accounting handoff's sender-side state. */
export const useQuerySalesHandoffSwr = (scope: SalesInstallationScope, input: SalesHandoffRequest) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(accessToken === null ? null : salesHandoffQueryKey(scope, input), () => readSalesHandoff(accessToken, scope, input, salesReadIdentity("sales.handoff@1", scope.installationId, input.handoffId)));
};