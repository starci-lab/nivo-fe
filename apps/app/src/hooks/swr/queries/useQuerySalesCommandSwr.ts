import { readSalesCommand, type SalesCommandRequest, type SalesInstallationScope } from "@/modules/api/sales"
import { operationReadIdentity } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { salesCommandQueryKey } from "./queries.shared"

/**
 * Read one command plan's committed state.
 *
 * @param enabled - False while the installation scope or the command identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesCommandSwr = (scope: SalesInstallationScope, input: SalesCommandRequest, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoQuery(enabled && accessToken !== null ? salesCommandQueryKey(scope, input) : null, () =>
        readSalesCommand(
            accessToken,
            scope,
            input,
            operationReadIdentity("sales.command@1", scope.installationId, input.commandId),
        ),
    )
}
