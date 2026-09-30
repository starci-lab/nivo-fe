import { readSalesOpportunity, type SalesInstallationScope, type SalesOpportunityRequest } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { salesOpportunityQueryKey } from "./queries.shared"

/**
 * Read one opportunity's committed state.
 *
 * @param enabled - False while the installation scope or the selector is not yet known; a held read
 *   addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesOpportunitySwr = (
    scope: SalesInstallationScope,
    input: SalesOpportunityRequest,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesOpportunityQueryKey(scope, input) : null, () =>
        readSalesOpportunity(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.opportunity@1", scope.installationId, input.opportunityId),
        ),
    )
}
