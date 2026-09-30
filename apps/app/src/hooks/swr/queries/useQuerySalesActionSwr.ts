import { readSalesAction, type SalesActionRequest, type SalesInstallationScope } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { salesActionQueryKey } from "./queries.shared"

/**
 * Read one Sales action's stored state.
 *
 * @param enabled - False while the installation scope or the action identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesActionSwr = (scope: SalesInstallationScope, input: SalesActionRequest, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesActionQueryKey(scope, input) : null, () =>
        readSalesAction(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.action@1", scope.installationId, input.actionId),
        ),
    )
}
