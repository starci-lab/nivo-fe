"use client"

import {
    readAccountingEvidence,
    type AccountingEvidenceInput,
    type AccountingInstallationScope,
} from "@/modules/api/accounting"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { type NivoQueryKey } from "../swr.shared"

/* One hook per file, one registered read per hook. */

/** Cache identity for one evidence identity inside one installation. */
export const accountingEvidenceQueryKey = (
    scope: AccountingInstallationScope,
    input: AccountingEvidenceInput,
): NivoQueryKey => [
    "accounting",
    "evidence",
    scope.workspaceId,
    scope.instanceId,
    scope.installationId,
    input.evidenceId,
]

/**
 * Read one evidence identity and its intake state through the registered operation route.
 *
 * @param enabled - False while the installation scope or the selector is not yet known; a held read
 *   addresses nothing rather than addressing a half-filled operation path.
 */
export const useQueryAccountingEvidenceSwr = (
    scope: AccountingInstallationScope,
    input: AccountingEvidenceInput,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? accountingEvidenceQueryKey(scope, input) : null, () =>
        readAccountingEvidence(
            accessToken,
            scope,
            input,
            operationReadIdentity("accounting.evidence@1", scope.installationId, input.evidenceId),
        ),
    )
}
