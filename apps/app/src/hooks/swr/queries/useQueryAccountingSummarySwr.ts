import { readAccountingSummary, type AccountingInstallationScope, type AccountingSummaryQueryInput } from "@/modules/api/accounting"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { accountingSummaryQueryKey } from "./queries.shared"

/**
 * Read one canonical summary period with its explicit partial coverage and continuation.
 *
 * @param enabled - False until the installation scope is resolved.
 */
export const useQueryAccountingSummarySwr = (
    scope: AccountingInstallationScope,
    input: AccountingSummaryQueryInput,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? accountingSummaryQueryKey(scope, input) : null, () =>
        readAccountingSummary(
            accessToken,
            scope,
            input,
            operationReadIdentity(
                "accounting.summary@1",
                scope.installationId,
                input.periodStart,
                input.periodEndExclusive,
                input.currency,
                input.cursor,
            ),
        ),
    )
}
