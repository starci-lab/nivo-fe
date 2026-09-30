import { readSalesPolicy, type SalesInstallationScope, type SalesPolicyRequest } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { salesPolicyQueryKey } from "./queries.shared"

/**
 * Read one installation's operating policy, or the revision one configure request stored.
 *
 * @param enabled - False while the installation scope or the selector is not yet known; a held read
 *   addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesPolicySwr = (scope: SalesInstallationScope, input: SalesPolicyRequest, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesPolicyQueryKey(scope, input) : null, () =>
        readSalesPolicy(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.policy@1", scope.installationId, input.requestId),
        ),
    )
}
