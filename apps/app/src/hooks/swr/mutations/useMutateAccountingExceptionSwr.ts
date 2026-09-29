"use client";

import { commandAccountingException, type AccountingExceptionInput, type AccountingInstallationScope } from "@/modules/api/accounting";
import { operationMutationKey, type OperationTrigger } from "@/modules/api/operation-route";
import { useAccessToken } from "../../auth/useAccessToken";
import { useNivoMutation } from "../useNivoMutation";

/* One hook per file, one registered command per hook. */

/** Answer, defer, reopen, escalate or dismiss one material exception at its exact revision. */
export const useMutateAccountingExceptionSwr = (scope: AccountingInstallationScope, enabled = true) => {
  const accessToken = useAccessToken();
  return useNivoMutation(enabled ? operationMutationKey("accounting", "exception", scope) : null, (trigger: OperationTrigger<AccountingExceptionInput>) => commandAccountingException(accessToken, scope, trigger.input, trigger.requestId));
};