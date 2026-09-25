"use client";

import { readAccountingResultDetail, type AccountingInstallationScope, type AccountingResultDetailInput } from "@/modules/api/accounting";
import { useSession } from "@/modules/auth/session";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/* One hook per file: the token reader and the stable read identity are private here, never shared. */

const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

const accountingReadIdentity = (operation: string, ...parts: ReadonlyArray<string | null>): string => `${operation}/${parts.map(part => part ?? "-").join("/")}`;

/** Cache identity for one current or historical result detail inside one installation. */
export const accountingResultDetailQueryKey = (scope: AccountingInstallationScope, input: AccountingResultDetailInput): NivoQueryKey =>
  ["accounting", "result-detail", scope.workspaceId, scope.instanceId, scope.installationId, input.action, input.action === "current" ? input.resultId : input.itemId, input.action === "current" ? "current" : input.asOf];

/**
 * Read one current or historical result detail with its lineage.
 *
 * @param enabled - False until the installation scope and the selector are both known.
 */
export const useQueryAccountingResultDetailSwr = (scope: AccountingInstallationScope, input: AccountingResultDetailInput, enabled = true) => {
  const accessToken = useAccountingAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? accountingResultDetailQueryKey(scope, input) : null, () => readAccountingResultDetail(accessToken, scope, input, accountingReadIdentity("accounting.resultDetail@1", scope.installationId, input.action === "current" ? input.resultId : input.itemId, input.action === "current" ? null : input.asOf)));
};