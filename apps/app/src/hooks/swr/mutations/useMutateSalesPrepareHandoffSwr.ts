"use client"

import {
    commandSalesPrepareHandoff,
    type SalesInstallationScope,
    type SalesPrepareHandoffRequest,
} from "@/modules/api/sales"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { salesHandoffQueryKey } from "../queries/useQuerySalesHandoffSwr"

/*
 * One hook per file, one registered command per hook.
 *
 * PREPARING CONTACTS NOBODY: the read that invalidates is the handoff's own sender-side state, and
 * whether Accounting admitted it stays Accounting's disclosure.
 */

/**
 * Prepare one confirmed-order handoff and refresh the handoff it names.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesPrepareHandoffSwr = (scope: SalesInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("sales", "prepare-handoff", scope) : null,
        (trigger: OperationTrigger<SalesPrepareHandoffRequest>) =>
            commandSalesPrepareHandoff(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [salesHandoffQueryKey(scope, { handoffId: trigger.input.handoffId })],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
