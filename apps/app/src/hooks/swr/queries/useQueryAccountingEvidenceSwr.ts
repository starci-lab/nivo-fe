"use client";

import { readAccountingEvidence, type AccountingEvidenceInput, type AccountingInstallationScope } from "@/modules/api/accounting";
import { useSession } from "../../auth/useSession";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file. The token reader and the stable read identity are private here rather than
 * shared: checkSourceNames exempts only a file whose basename is the hook it exports, and no shared
 * non-hook helper path is in this slice's grant.
 */

const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

const accountingReadIdentity = (operation: string, ...parts: ReadonlyArray<string | null>): string => `${operation}/${parts.map(part => part ?? "-").join("/")}`;

/** Cache identity for one evidence identity inside one installation. */
export const accountingEvidenceQueryKey = (scope: AccountingInstallationScope, input: AccountingEvidenceInput): NivoQueryKey =>
  ["accounting", "evidence", scope.workspaceId, scope.instanceId, scope.installationId, input.evidenceId];

/**
 * Read one evidence identity and its intake state through the registered operation route.
 *
 * @param enabled - False while the installation scope or the selector is not yet known; a held read
 *   addresses nothing rather than addressing a half-filled operation path.
 */
export const useQueryAccountingEvidenceSwr = (scope: AccountingInstallationScope, input: AccountingEvidenceInput, enabled = true) => {
  const accessToken = useAccountingAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? accountingEvidenceQueryKey(scope, input) : null, () => readAccountingEvidence(accessToken, scope, input, accountingReadIdentity("accounting.evidence@1", scope.installationId, input.evidenceId)));
};