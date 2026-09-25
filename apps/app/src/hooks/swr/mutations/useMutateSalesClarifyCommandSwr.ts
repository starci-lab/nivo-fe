"use client";

import { commandSalesClarifyCommand, type SalesAnswer, type SalesClarifyCommandRequest, type SalesInstallationScope } from "@/modules/api/sales";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import { salesCommandQueryKey } from "../queries/useQuerySalesCommandSwr";

/*
 * One hook per file, one registered command per hook. The token reader, the press-local identity and
 * the answer test are private here: `checkSourceNames` exempts only a file whose basename is the hook
 * it exports, and no shared non-hook helper path is in this slice's grant.
 *
 * A CLARIFICATION REFINES THE SAME COMMAND PLAN, so it refreshes that plan and never a second one:
 * the input carries the plan's own pending clarification revision.
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
 * Refine one awaiting-clarification command plan and refresh that same plan.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesClarifyCommandSwr = (scope: SalesInstallationScope, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoMutation(enabled ? salesCommandMutationKey("clarify-command", scope) : null, (trigger: SalesCommandTrigger<SalesClarifyCommandRequest>) => commandSalesClarifyCommand(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [salesCommandQueryKey(scope, { commandId: trigger.input.commandId })], shouldInvalidate: salesAnswerNeedsRead });
};