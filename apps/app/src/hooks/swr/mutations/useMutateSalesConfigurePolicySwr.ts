
import {
    commandSalesConfigurePolicy,
    type SalesConfigurePolicyRequest,
    type SalesInstallationScope,
} from "@/modules/api/sales"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { salesPolicyQueryKey } from "../queries/queries.shared"

/*
 * One hook per file, one registered command per hook.
 *
 * THE READ THIS PRESS OWES IS THE WHOLE INVALIDATION. contract.sales.public-operations binds every
 * mutation to exactly one read of the same Sales-owned object: a served result confirms the effect and
 * an unknown outcome is exactly what that read resolves, so both invalidate it. A refusal invalidates
 * nothing: no effect was disclosed, so there is nothing new to read.
 */

/**
 * Record one operating-policy revision and refresh the revision the request identity stored.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesConfigurePolicySwr = (scope: SalesInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("sales", "configure-policy", scope) : null,
        (trigger: OperationTrigger<SalesConfigurePolicyRequest>) =>
            commandSalesConfigurePolicy(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [
                salesPolicyQueryKey(scope, {
                    salesInstallationId: trigger.input.salesInstallationId,
                    requestId: trigger.input.requestId,
                }),
            ],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
