"use client";

import {
  commandSalesClarifyCommand,
  commandSalesClose,
  commandSalesConfigurePolicy,
  commandSalesDecideProposal,
  commandSalesPrepareHandoff,
  commandSalesRecoverAction,
  commandSalesSubmitCommand,
  commandSalesSubmitHandoff,
  type SalesAnswer,
  type SalesClarifyCommandRequest,
  type SalesCloseRequest,
  type SalesConfigurePolicyRequest,
  type SalesDecideProposalRequest,
  type SalesInstallationScope,
  type SalesPrepareHandoffRequest,
  type SalesRecoverActionRequest,
  type SalesSubmitCommandRequest,
  type SalesSubmitHandoffRequest
} from "@/modules/api/sales";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import {
  salesActionQueryKey,
  salesCommandQueryKey,
  salesDecisionRequestQueryKey,
  salesHandoffQueryKey,
  salesOpportunityQueryKey,
  salesPolicyQueryKey
} from "../queries/sales";

/*
 * THE INSTALLATION-SCOPED SALES COMMANDS.
 *
 * One press is one call, and it carries the stable identity that press minted under its own requestId
 * - so a replayed press is the same intent rather than a second one, and an answer nobody can attest
 * is never turned into a completion here.
 *
 * THE READ EACH PRESS OWES IS THE WHOLE INVALIDATION. contract.sales.public-operations binds every
 * mutation to exactly one read of the same Sales-owned object: a served result confirms the effect and
 * an unknown outcome is exactly what that read resolves, so both invalidate it, and nothing else is
 * touched. A refusal invalidates nothing: no effect was disclosed, so there is nothing new to read.
 */

/** The signed-in access token, or null when no session holds one. */
const useSalesAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** One press of a Sales command: the receiver's own input plus the stable identity it replays under. */
export type SalesCommandTrigger<TInput> = { readonly requestId: string; readonly input: TInput };

/** The press-local identity of one Sales command inside one installation. */
const salesCommandMutationKey = (name: string, scope: SalesInstallationScope): NivoMutationKey => ["sales", name, scope.workspaceId, scope.instanceId, scope.installationId];

/** Whether an answer still owes a read: a served result confirms it, and an unknown outcome only a read resolves. */
const salesAnswerNeedsRead = (answer: SalesAnswer<unknown>): boolean => answer.ok || answer.code === "outcome_unknown" || answer.code === "DEADLINE_EXCEEDED";

/** Record one operating-policy revision and refresh the revision the request identity stored. */
export const useMutateSalesConfigurePolicySwr = (scope: SalesInstallationScope) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(salesCommandMutationKey("configure-policy", scope), (trigger: SalesCommandTrigger<SalesConfigurePolicyRequest>) => commandSalesConfigurePolicy(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesPolicyQueryKey(scope, { salesInstallationId: trigger.input.salesInstallationId, requestId: trigger.input.requestId })], shouldInvalidate: salesAnswerNeedsRead });
};

/** Submit one bounded command plan and refresh the command plan it names. */
export const useMutateSalesSubmitCommandSwr = (scope: SalesInstallationScope) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(salesCommandMutationKey("submit-command", scope), (trigger: SalesCommandTrigger<SalesSubmitCommandRequest>) => commandSalesSubmitCommand(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesCommandQueryKey(scope, { commandId: trigger.input.commandId })], shouldInvalidate: salesAnswerNeedsRead });
};

/** Refine one awaiting-clarification command plan and refresh that same plan. */
export const useMutateSalesClarifyCommandSwr = (scope: SalesInstallationScope) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(salesCommandMutationKey("clarify-command", scope), (trigger: SalesCommandTrigger<SalesClarifyCommandRequest>) => commandSalesClarifyCommand(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesCommandQueryKey(scope, { commandId: trigger.input.commandId })], shouldInvalidate: salesAnswerNeedsRead });
};

/** Answer one immutable proposal and refresh the decision request it answered. */
export const useMutateSalesDecideProposalSwr = (scope: SalesInstallationScope) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(salesCommandMutationKey("decide-proposal", scope), (trigger: SalesCommandTrigger<SalesDecideProposalRequest>) => commandSalesDecideProposal(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesDecisionRequestQueryKey(scope, { decisionRequestId: trigger.input.decisionRequestId })], shouldInvalidate: salesAnswerNeedsRead });
};

/** Close or hold one opportunity and refresh that opportunity. */
export const useMutateSalesCloseSwr = (scope: SalesInstallationScope) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(salesCommandMutationKey("close", scope), (trigger: SalesCommandTrigger<SalesCloseRequest>) => commandSalesClose(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesOpportunityQueryKey(scope, { opportunityId: trigger.input.opportunityId })], shouldInvalidate: salesAnswerNeedsRead });
};

/** Prepare one confirmed-order handoff and refresh the handoff it names. */
export const useMutateSalesPrepareHandoffSwr = (scope: SalesInstallationScope) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(salesCommandMutationKey("prepare-handoff", scope), (trigger: SalesCommandTrigger<SalesPrepareHandoffRequest>) => commandSalesPrepareHandoff(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesHandoffQueryKey(scope, { handoffId: trigger.input.handoffId })], shouldInvalidate: salesAnswerNeedsRead });
};

/** Admit one prepared handoff and refresh the handoff it names. */
export const useMutateSalesSubmitHandoffSwr = (scope: SalesInstallationScope) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(salesCommandMutationKey("submit-handoff", scope), (trigger: SalesCommandTrigger<SalesSubmitHandoffRequest>) => commandSalesSubmitHandoff(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesHandoffQueryKey(scope, { handoffId: trigger.input.handoffId })], shouldInvalidate: salesAnswerNeedsRead });
};

/** Retry after proven no-start, or stop, and refresh the action it names. */
export const useMutateSalesRecoverActionSwr = (scope: SalesInstallationScope) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(salesCommandMutationKey("recover-action", scope), (trigger: SalesCommandTrigger<SalesRecoverActionRequest>) => commandSalesRecoverAction(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesActionQueryKey(scope, { actionId: trigger.input.actionId })], shouldInvalidate: salesAnswerNeedsRead });
};