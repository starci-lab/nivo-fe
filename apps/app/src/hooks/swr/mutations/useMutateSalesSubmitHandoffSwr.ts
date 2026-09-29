"use client"

import {
    commandSalesSubmitHandoff,
    type SalesInstallationScope,
    type SalesSubmitHandoffRequest,
} from "@/modules/api/sales"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { salesHandoffQueryKey } from "../queries/useQuerySalesHandoffSwr"

/*
 * One hook per file, one registered command per hook.
 *
 * SUBMISSION MOVES THE SAME HANDOFF, at the confirmed-order revision and fingerprint the input
 * carries, so exactly that handoff is read back and no second handoff is addressed.
 */

/**
 * Admit one prepared handoff and refresh the handoff it names.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesSubmitHandoffSwr = (scope: SalesInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("sales", "submit-handoff", scope) : null,
        (trigger: OperationTrigger<SalesSubmitHandoffRequest>) =>
            commandSalesSubmitHandoff(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [salesHandoffQueryKey(scope, { handoffId: trigger.input.handoffId })],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
