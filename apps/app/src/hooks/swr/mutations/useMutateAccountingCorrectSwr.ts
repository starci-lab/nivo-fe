"use client";

import { commandAccountingCorrect, type AccountingCorrectInput, type AccountingInstallationScope, type AccountingOperationAnswer, type AccountingResult } from "@/modules/api/accounting";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import { accountingResultDetailQueryKey } from "../queries/useQueryAccountingResultDetailSwr";

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

/** Propose, append or proof-retry one forward correction and refresh the result lineage it names. */
export const useMutateAccountingCorrectSwr = (scope: AccountingInstallationScope, enabled = true) => {
  const accessToken = useAccountingAccessToken();
  return useNivoMutation(enabled ? accountingCommandMutationKey("correct", scope) : null, (trigger: AccountingCommandTrigger<AccountingCorrectInput>) => commandAccountingCorrect(accessToken, scope, trigger.input, trigger.requestId), {
    invalidates: (trigger, answer) => {
      const resultId = answer.ok ? answer.data.payload.resultId : trigger.input.action === "propose" ? trigger.input.predecessorResultId : null;
      return resultId === null ? [] : [accountingResultDetailQueryKey(scope, { action: "current", resultId })];
    },
    shouldInvalidate: accountingAnswerNeedsRead
  });
};