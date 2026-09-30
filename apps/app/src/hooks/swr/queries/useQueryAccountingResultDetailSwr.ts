import { readAccountingResultDetail, type AccountingInstallationScope, type AccountingResultDetailInput } from "@/modules/api/accounting"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { accountingResultDetailQueryKey } from "./queries.shared"

/**
 * Read one current or historical result detail with its lineage.
 *
 * @param enabled - False until the installation scope and the selector are both known.
 */
export const useQueryAccountingResultDetailSwr = (
    scope: AccountingInstallationScope,
    input: AccountingResultDetailInput,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? accountingResultDetailQueryKey(scope, input) : null, () =>
        readAccountingResultDetail(
            accessToken,
            scope,
            input,
            operationReadIdentity(
                "accounting.resultDetail@1",
                scope.installationId,
                input.action === "current" ? input.resultId : input.itemId,
                input.action === "current" ? null : input.asOf,
            ),
        ),
    )
}
