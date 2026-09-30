import { readSalesHandoff, type SalesHandoffRequest, type SalesInstallationScope } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { salesHandoffQueryKey } from "./queries.shared"

/**
 * Read one Accounting handoff's sender-side state.
 *
 * @param enabled - False while the installation scope or the handoff identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesHandoffSwr = (scope: SalesInstallationScope, input: SalesHandoffRequest, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesHandoffQueryKey(scope, input) : null, () =>
        readSalesHandoff(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.handoff@1", scope.installationId, input.handoffId),
        ),
    )
}
