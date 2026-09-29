"use client"

import {
    commandSalesRecoverAction,
    type SalesInstallationScope,
    type SalesRecoverActionRequest,
} from "@/modules/api/sales"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { salesActionQueryKey } from "../queries/useQuerySalesActionSwr"

/*
 * One hook per file, one registered command per hook.
 *
 * ONE REGISTERED NAME, TWO RECOVERY DOORS: a retry may only be sent with the durable no-start proof
 * and the worker fence the action read disclosed, and a stop only with that same fence - so the read
 * that invalidates is the action's own stored state, and it is what settles either door.
 *
 * NOTE: the answer test is the shared one, so a retry whose outcome is unknown also owes its read
 * rather than being sent again.
 */

/**
 * Retry after proven no-start, or stop, and refresh the action it names.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesRecoverActionSwr = (scope: SalesInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("sales", "recover-action", scope) : null,
        (trigger: OperationTrigger<SalesRecoverActionRequest>) =>
            commandSalesRecoverAction(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [salesActionQueryKey(scope, { actionId: trigger.input.actionId })],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
