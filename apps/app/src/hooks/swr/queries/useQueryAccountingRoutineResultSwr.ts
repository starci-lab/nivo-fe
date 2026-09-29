"use client";

import { readAccountingRoutineResult, type AccountingInstallationScope, type AccountingRoutineResultInput } from "@/modules/api/accounting";
import { operationReadIdentity } from "@/modules/api/operation-route";
import { useAccessToken } from "../../auth/useAccessToken";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/* One hook per file, one registered read per hook. */

/** Cache identity for one routine intent inside one installation. */
export const accountingRoutineResultQueryKey = (scope: AccountingInstallationScope, input: AccountingRoutineResultInput): NivoQueryKey =>
  ["accounting", "routine-result", scope.workspaceId, scope.instanceId, scope.installationId, input.intentId];

/**
 * Read the stable state of one routine intent, the only read an uncertain routine is reconciled by.
 *
 * @param enabled - False while the installation scope or the intent is not yet known.
 */
export const useQueryAccountingRoutineResultSwr = (scope: AccountingInstallationScope, input: AccountingRoutineResultInput, enabled = true) => {
  const accessToken = useAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? accountingRoutineResultQueryKey(scope, input) : null, () => readAccountingRoutineResult(accessToken, scope, input, operationReadIdentity("accounting.routineResult@1", scope.installationId, input.intentId)));
};