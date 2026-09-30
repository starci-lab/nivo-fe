
import { commandSalesClose, type SalesCloseRequest, type SalesInstallationScope } from "@/modules/api/sales"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { salesOpportunityQueryKey } from "../queries/queries.shared"

/*
 * One hook per file, one registered command per hook.
 *
 * A CLOSE IS SETTLED BY READING THE OPPORTUNITY IT CLOSED, at the revision the input expected, so an
 * unknown outcome is reconciled rather than resent as a second close.
 */

/**
 * Close or hold one opportunity and refresh that opportunity.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesCloseSwr = (scope: SalesInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("sales", "close", scope) : null,
        (trigger: OperationTrigger<SalesCloseRequest>) =>
            commandSalesClose(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [salesOpportunityQueryKey(scope, { opportunityId: trigger.input.opportunityId })],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
