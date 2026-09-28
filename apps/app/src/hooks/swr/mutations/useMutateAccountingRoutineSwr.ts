"use client";

import { commandAccountingRoutine, type AccountingInstallationScope, type AccountingOperationAnswer, type AccountingResult, type AccountingRoutineInput } from "@/modules/api/accounting";
import { useSession } from "../../auth/useSession";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import { accountingRoutineResultQueryKey } from "../queries/useQueryAccountingRoutineResultSwr";

/* One hook per file: the token reader, the press-local identity and the answer test are private here. */

const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** One press of an Accounting command: the receiver's own input plus the stable identity it replays under. */
export type AccountingCommandTrigger<TInput> = { readonly requestId: string; readonly input: TInput };

const accountingCommandMutationKey = (name: string, scope: AccountingInstallationScope): NivoMutationKey => ["accounting", name, scope.workspaceId, scope.instanceId, scope.installationId];

/** Whether an answer still owes a read: a served result confirms it, and an unknown outcome only a read resolves. */
const accountingAnswerNeedsRead = (answer: AccountingOperationAnswer<AccountingResult>): boolean => answer.ok || answer.code === "outcome_unknown";

/** Commit one routine decision, or retry an attempt with the proof that it never started. */
export const useMutateAccountingRoutineSwr = (scope: AccountingInstallationScope, enabled = true) => {
  const accessToken = useAccountingAccessToken();
  return useNivoMutation(enabled ? accountingCommandMutationKey("routine", scope) : null, (trigger: AccountingCommandTrigger<AccountingRoutineInput>) => commandAccountingRoutine(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [accountingRoutineResultQueryKey(scope, { intentId: trigger.input.intentId })], shouldInvalidate: accountingAnswerNeedsRead });
};