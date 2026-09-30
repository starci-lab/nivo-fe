
import {
    commandSalesClarifyCommand,
    type SalesClarifyCommandRequest,
    type SalesInstallationScope,
} from "@/modules/api/sales"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { salesCommandQueryKey } from "../queries/queries.shared"

/*
 * One hook per file, one registered command per hook.
 *
 * A CLARIFICATION REFINES THE SAME COMMAND PLAN, so it refreshes that plan and never a second one:
 * the input carries the plan's own pending clarification revision.
 */

/**
 * Refine one awaiting-clarification command plan and refresh that same plan.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesClarifyCommandSwr = (scope: SalesInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("sales", "clarify-command", scope) : null,
        (trigger: OperationTrigger<SalesClarifyCommandRequest>) =>
            commandSalesClarifyCommand(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [salesCommandQueryKey(scope, { commandId: trigger.input.commandId })],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
