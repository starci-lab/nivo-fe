"use client";

import { readAccountingRoutineResult, type AccountingInstallationScope, type AccountingRoutineResultInput } from "@/modules/api/accounting";
import { useSession } from "../../auth/useSession";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/* One hook per file: the token reader and the stable read identity are private here, never shared. */

const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

const accountingReadIdentity = (operation: string, ...parts: ReadonlyArray<string | null>): string => `${operation}/${parts.map(part => part ?? "-").join("/")}`;

/** Cache identity for one routine intent inside one installation. */
export const accountingRoutineResultQueryKey = (scope: AccountingInstallationScope, input: AccountingRoutineResultInput): NivoQueryKey =>
  ["accounting", "routine-result", scope.workspaceId, scope.instanceId, scope.installationId, input.intentId];

/**
 * Read the stable state of one routine intent, the only read an uncertain routine is reconciled by.
 *
 * @param enabled - False while the installation scope or the intent is not yet known.
 */
export const useQueryAccountingRoutineResultSwr = (scope: AccountingInstallationScope, input: AccountingRoutineResultInput, enabled = true) => {
  const accessToken = useAccountingAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? accountingRoutineResultQueryKey(scope, input) : null, () => readAccountingRoutineResult(accessToken, scope, input, accountingReadIdentity("accounting.routineResult@1", scope.installationId, input.intentId)));
};