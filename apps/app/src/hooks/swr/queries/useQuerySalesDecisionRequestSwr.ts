import { readSalesDecisionRequest, type SalesDecisionRequestRequest, type SalesInstallationScope } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { salesDecisionRequestQueryKey } from "./queries.shared"

/**
 * Read one decision request's committed state.
 *
 * @param enabled - False while the installation scope or the decision identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesDecisionRequestSwr = (
    scope: SalesInstallationScope,
    input: SalesDecisionRequestRequest,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesDecisionRequestQueryKey(scope, input) : null, () =>
        readSalesDecisionRequest(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.decisionRequest@1", scope.installationId, input.decisionRequestId),
        ),
    )
}
