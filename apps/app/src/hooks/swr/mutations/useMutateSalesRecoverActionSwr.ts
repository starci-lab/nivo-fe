"use client";

import { commandSalesRecoverAction, type SalesAnswer, type SalesInstallationScope, type SalesRecoverActionRequest } from "@/modules/api/sales";
import { useSession } from "../../auth/useSession";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import { salesActionQueryKey } from "../queries/useQuerySalesActionSwr";

/*
 * One hook per file, one registered command per hook. The token reader, the press-local identity and
 * the answer test are private here: `checkSourceNames` exempts only a file whose basename is the hook
 * it exports, and no shared non-hook helper path is in this slice's grant.
 *
 * ONE REGISTERED NAME, TWO RECOVERY DOORS: a retry may only be sent with the durable no-start proof
 * and the worker fence the action read disclosed, and a stop only with that same fence - so the read
 * that invalidates is the action's own stored state, and it is what settles either door.
 *
 * NOTE: the answer test is the shared one, so a retry whose outcome is unknown also owes its read
 * rather than being sent again.
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
 * Retry after proven no-start, or stop, and refresh the action it names.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesRecoverActionSwr = (scope: SalesInstallationScope, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(enabled ? salesCommandMutationKey("recover-action", scope) : null, (trigger: SalesCommandTrigger<SalesRecoverActionRequest>) => commandSalesRecoverAction(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesActionQueryKey(scope, { actionId: trigger.input.actionId })], shouldInvalidate: salesAnswerNeedsRead });
};