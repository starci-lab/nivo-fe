import { readAccountingEvidence, type AccountingEvidenceInput, type AccountingInstallationScope } from "@/modules/api/accounting"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { accountingEvidenceQueryKey } from "./queries.shared"

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
