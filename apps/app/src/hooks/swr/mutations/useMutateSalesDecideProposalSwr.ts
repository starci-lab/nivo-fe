"use client";

import { commandSalesDecideProposal, type SalesAnswer, type SalesDecideProposalRequest, type SalesInstallationScope } from "@/modules/api/sales";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import { salesDecisionRequestQueryKey } from "../queries/useQuerySalesDecisionRequestSwr";

/*
 * One hook per file, one registered command per hook. The token reader, the press-local identity and
 * the answer test are private here: `checkSourceNames` exempts only a file whose basename is the hook
 * it exports, and no shared non-hook helper path is in this slice's grant.
 *
 * AN ANSWER IS SETTLED BY THE DECISION REQUEST IT ANSWERED, at the exact proposal version and
 * fingerprint the input carries, so the read that invalidates is that request and nothing else.
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

/**
 * Answer one immutable proposal and refresh the decision request it answered.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesDecideProposalSwr = (scope: SalesInstallationScope, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(enabled ? salesCommandMutationKey("decide-proposal", scope) : null, (trigger: SalesCommandTrigger<SalesDecideProposalRequest>) => commandSalesDecideProposal(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesDecisionRequestQueryKey(scope, { decisionRequestId: trigger.input.decisionRequestId })], shouldInvalidate: salesAnswerNeedsRead });
};