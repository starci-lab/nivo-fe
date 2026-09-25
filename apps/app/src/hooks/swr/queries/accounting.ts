"use client";

import {
  readAccountingEvidence,
  readAccountingResultDetail,
  readAccountingRoutineResult,
  readAccountingSummary,
  readAccountingWorkbench,
  resolveAppliedAccountingContext,
  type AccountingEvidenceInput,
  type AccountingInstallationScope,
  type AccountingResultDetailInput,
  type AccountingRoutineResultInput,
  type AccountingSummaryQueryInput
} from "@/modules/api/accounting";
import { useSession } from "@/modules/auth/session";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/** Cache identity for one applied Accounting context. */
export const accountingContextQueryKey = (installationId: string) => ["accounting", "context", installationId] as const;
/** Cache identity for an exact current or historical Accounting statement. */
export const accountingWorkbenchQueryKey = (installationId: string, currency: string, ledgerVersion?: string) => ["accounting", "workbench", installationId, currency, ledgerVersion ?? "current"] as const;

/** Read one installation's applied immutable Accounting context. */
export const useQueryAppliedAccountingContextSwr = (installationId: string) => useNivoQuery(accountingContextQueryKey(installationId), () => resolveAppliedAccountingContext(installationId));
/** Read one versioned Accounting workbench in the signed-in viewer cache. */
export const useQueryAccountingWorkbenchSwr = (installationId: string, currency?: string, ledgerVersion?: string) => useNivoQuery(currency === undefined ? null : accountingWorkbenchQueryKey(installationId, currency, ledgerVersion), () => readAccountingWorkbench(installationId, currency!, ledgerVersion));

/*
 * THE INSTALLATION-SCOPED ACCOUNTING READS.
 *
 * Each read below is one POST to its registered operation address through the client, cached under a
 * key made only of the installation coordinates and the read's own selector - so two installations,
 * or two selectors, can never share an entry.
 *
 * A read's stable identity is derived from that same key: it is the identity the route echoes, so a
 * re-read of one selector is one identity rather than a new one each render.
 */

/** The signed-in access token, or null when no session holds one. */
const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** The stable identity one Accounting read is addressed by: its registered name and its own selector. */
const accountingReadIdentity = (operation: string, ...parts: ReadonlyArray<string | null>): string => `${operation}/${parts.map(part => part ?? "-").join("/")}`;

/** Cache identity for one evidence identity inside one installation. */
export const accountingEvidenceQueryKey = (scope: AccountingInstallationScope, input: AccountingEvidenceInput): NivoQueryKey => ["accounting", "evidence", scope.workspaceId, scope.instanceId, scope.installationId, input.evidenceId];
/** Cache identity for one routine intent inside one installation. */
export const accountingRoutineResultQueryKey = (scope: AccountingInstallationScope, input: AccountingRoutineResultInput): NivoQueryKey => ["accounting", "routine-result", scope.workspaceId, scope.instanceId, scope.installationId, input.intentId];
/** Cache identity for one summary page inside one installation. */
export const accountingSummaryQueryKey = (scope: AccountingInstallationScope, input: AccountingSummaryQueryInput): NivoQueryKey => ["accounting", "summary", scope.workspaceId, scope.instanceId, scope.installationId, input.periodStart, input.periodEndExclusive, input.currency ?? "all-currencies", input.pageSize, input.cursor ?? "first-page"];
/** Cache identity for one current or historical result detail inside one installation. */
export const accountingResultDetailQueryKey = (scope: AccountingInstallationScope, input: AccountingResultDetailInput): NivoQueryKey => ["accounting", "result-detail", scope.workspaceId, scope.instanceId, scope.installationId, input.action, input.action === "current" ? input.resultId : input.itemId, input.action === "current" ? "current" : input.asOf];

/** Read one evidence identity and its intake state. */
export const useQueryAccountingEvidenceSwr = (scope: AccountingInstallationScope, input: AccountingEvidenceInput) => {
  const accessToken = useAccountingAccessToken();
  return useNivoQuery(accessToken === null ? null : accountingEvidenceQueryKey(scope, input), () => readAccountingEvidence(accessToken, scope, input, accountingReadIdentity("accounting.evidence@1", scope.installationId, input.evidenceId)));
};

/** Read the stable state of one routine intent. */
export const useQueryAccountingRoutineResultSwr = (scope: AccountingInstallationScope, input: AccountingRoutineResultInput) => {
  const accessToken = useAccountingAccessToken();
  return useNivoQuery(accessToken === null ? null : accountingRoutineResultQueryKey(scope, input), () => readAccountingRoutineResult(accessToken, scope, input, accountingReadIdentity("accounting.routineResult@1", scope.installationId, input.intentId)));
};

/** Read one canonical summary period with its explicit partial coverage and continuation. */
export const useQueryAccountingSummarySwr = (scope: AccountingInstallationScope, input: AccountingSummaryQueryInput) => {
  const accessToken = useAccountingAccessToken();
  return useNivoQuery(accessToken === null ? null : accountingSummaryQueryKey(scope, input), () => readAccountingSummary(accessToken, scope, input, accountingReadIdentity("accounting.summary@1", scope.installationId, input.periodStart, input.periodEndExclusive, input.currency, input.cursor)));
};

/** Read one current or historical result detail with its lineage. */
export const useQueryAccountingResultDetailSwr = (scope: AccountingInstallationScope, input: AccountingResultDetailInput) => {
  const accessToken = useAccountingAccessToken();
  return useNivoQuery(accessToken === null ? null : accountingResultDetailQueryKey(scope, input), () => readAccountingResultDetail(accessToken, scope, input, accountingReadIdentity("accounting.resultDetail@1", scope.installationId, input.action === "current" ? input.resultId : input.itemId, input.action === "current" ? null : input.asOf)));
};
