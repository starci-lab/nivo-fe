import { readSalesPipeline, type SalesInstallationScope, type SalesPipelineRequest } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { salesPipelineQueryKey } from "./queries.shared"

/**
 * Read one bounded live page of the current pipeline.
 *
 * @param enabled - False while the installation scope or the page selector is not yet known; a held
 *   read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesPipelineSwr = (
    scope: SalesInstallationScope,
    input: SalesPipelineRequest,
    enabled = true,
) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesPipelineQueryKey(scope, input) : null, () =>
        readSalesPipeline(
            accessToken,
            scope,
            input,
            operationReadIdentity(
                "sales.pipeline@1",
                scope.installationId,
                input.scopeFingerprint,
                input.after?.lastOpportunityId ?? null,
            ),
        ),
    )
}
