"use client"

import {
    commandAccountingRoutine,
    type AccountingInstallationScope,
    type AccountingRoutineInput,
} from "@/modules/api/accounting"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { accountingRoutineResultQueryKey } from "../queries/useQueryAccountingRoutineResultSwr"

/* One hook per file, one registered command per hook. */

/** Commit one routine decision, or retry an attempt with the proof that it never started. */
export const useMutateAccountingRoutineSwr = (scope: AccountingInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("accounting", "routine", scope) : null,
        (trigger: OperationTrigger<AccountingRoutineInput>) =>
            commandAccountingRoutine(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [accountingRoutineResultQueryKey(scope, { intentId: trigger.input.intentId })],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
