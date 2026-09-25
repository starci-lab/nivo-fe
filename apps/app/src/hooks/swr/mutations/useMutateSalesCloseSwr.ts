"use client";

import { commandSalesClose, type SalesAnswer, type SalesCloseRequest, type SalesInstallationScope } from "@/modules/api/sales";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import { salesOpportunityQueryKey } from "../queries/useQuerySalesOpportunitySwr";

/*
 * One hook per file, one registered command per hook. The token reader, the press-local identity and
 * the answer test are private here: `checkSourceNames` exempts only a file whose basename is the hook
 * it exports, and no shared non-hook helper path is in this slice's grant.
 *
 * A CLOSE IS SETTLED BY READING THE OPPORTUNITY IT CLOSED, at the revision the input expected, so an
 * unknown outcome is reconciled rather than resent as a second close.
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
 * Close or hold one opportunity and refresh that opportunity.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesCloseSwr = (scope: SalesInstallationScope, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(enabled ? salesCommandMutationKey("close", scope) : null, (trigger: SalesCommandTrigger<SalesCloseRequest>) => commandSalesClose(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesOpportunityQueryKey(scope, { opportunityId: trigger.input.opportunityId })], shouldInvalidate: salesAnswerNeedsRead });
};