"use client";

import { commandAccountingException, type AccountingExceptionInput, type AccountingInstallationScope } from "@/modules/api/accounting";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";

/* One hook per file: the token reader and the press-local identity are private here. */

const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** One press of an Accounting command: the receiver's own input plus the stable identity it replays under. */
export type AccountingCommandTrigger<TInput> = { readonly requestId: string; readonly input: TInput };

const accountingCommandMutationKey = (name: string, scope: AccountingInstallationScope): NivoMutationKey => ["accounting", name, scope.workspaceId, scope.instanceId, scope.installationId];

/** Answer, defer, reopen, escalate or dismiss one material exception at its exact revision. */
export const useMutateAccountingExceptionSwr = (scope: AccountingInstallationScope, enabled = true) => {
  const accessToken = useAccountingAccessToken();
  return useNivoMutation(enabled ? accountingCommandMutationKey("exception", scope) : null, (trigger: AccountingCommandTrigger<AccountingExceptionInput>) => commandAccountingException(accessToken, scope, trigger.input, trigger.requestId));
};