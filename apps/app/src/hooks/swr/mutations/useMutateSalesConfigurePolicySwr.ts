"use client";

import { commandSalesConfigurePolicy, type SalesAnswer, type SalesConfigurePolicyRequest, type SalesInstallationScope } from "@/modules/api/sales";
import { useSession } from "../../auth/useSession";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import { salesPolicyQueryKey } from "../queries/useQuerySalesPolicySwr";

/*
 * One hook per file, one registered command per hook. The token reader, the press-local identity and
 * the answer test are private here: `checkSourceNames` exempts only a file whose basename is the hook
 * it exports, and no shared non-hook helper path is in this slice's grant.
 *
 * THE READ THIS PRESS OWES IS THE WHOLE INVALIDATION. contract.sales.public-operations binds every
 * mutation to exactly one read of the same Sales-owned object: a served result confirms the effect and
 * an unknown outcome is exactly what that read resolves, so both invalidate it. A refusal invalidates
 * nothing: no effect was disclosed, so there is nothing new to read.
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
 * Record one operating-policy revision and refresh the revision the request identity stored.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesConfigurePolicySwr = (scope: SalesInstallationScope, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(enabled ? salesCommandMutationKey("configure-policy", scope) : null, (trigger: SalesCommandTrigger<SalesConfigurePolicyRequest>) => commandSalesConfigurePolicy(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesPolicyQueryKey(scope, { salesInstallationId: trigger.input.salesInstallationId, requestId: trigger.input.requestId })], shouldInvalidate: salesAnswerNeedsRead });
};