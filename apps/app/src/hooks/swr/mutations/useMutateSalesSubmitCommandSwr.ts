
import {
    commandSalesSubmitCommand,
    type SalesInstallationScope,
    type SalesSubmitCommandRequest,
} from "@/modules/api/sales"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { salesCommandQueryKey } from "../queries/queries.shared"

/*
 * One hook per file, one registered command per hook.
 *
 * THE READ THIS PRESS OWES IS THE WHOLE INVALIDATION: a served result confirms the effect and an
 * unknown outcome is exactly what the command read of the same identity resolves, so both invalidate
 * it and nothing else is touched.
 */

/**
 * Submit one bounded command plan and refresh the command plan it names.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesSubmitCommandSwr = (scope: SalesInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("sales", "submit-command", scope) : null,
        (trigger: OperationTrigger<SalesSubmitCommandRequest>) =>
            commandSalesSubmitCommand(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [salesCommandQueryKey(scope, { commandId: trigger.input.commandId })],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
