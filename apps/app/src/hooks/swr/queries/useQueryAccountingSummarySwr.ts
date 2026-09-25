"use client";

import { readAccountingSummary, type AccountingInstallationScope, type AccountingSummaryQueryInput } from "@/modules/api/accounting";
import { useSession } from "@/modules/auth/session";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/* One hook per file: the token reader and the stable read identity are private here, never shared. */

const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

const accountingReadIdentity = (operation: string, ...parts: ReadonlyArray<string | null>): string => `${operation}/${parts.map(part => part ?? "-").join("/")}`;

/** Cache identity for one summary page inside one installation. */
export const accountingSummaryQueryKey = (scope: AccountingInstallationScope, input: AccountingSummaryQueryInput): NivoQueryKey =>
  ["accounting", "summary", scope.workspaceId, scope.instanceId, scope.installationId, input.periodStart, input.periodEndExclusive, input.currency ?? "all-currencies", input.pageSize, input.cursor ?? "first-page"];

/**
 * Read one canonical summary period with its explicit partial coverage and continuation.
 *
 * @param enabled - False until the installation scope is resolved.
 */
export const useQueryAccountingSummarySwr = (scope: AccountingInstallationScope, input: AccountingSummaryQueryInput, enabled = true) => {
  const accessToken = useAccountingAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? accountingSummaryQueryKey(scope, input) : null, () => readAccountingSummary(accessToken, scope, input, accountingReadIdentity("accounting.summary@1", scope.installationId, input.periodStart, input.periodEndExclusive, input.currency, input.cursor)));
};