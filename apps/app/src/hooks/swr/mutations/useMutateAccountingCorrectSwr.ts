"use client"

import {
    commandAccountingCorrect,
    type AccountingCorrectInput,
    type AccountingInstallationScope,
} from "@/modules/api/accounting"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { accountingResultDetailQueryKey } from "../queries/useQueryAccountingResultDetailSwr"

/* One hook per file, one registered command per hook. */

/** Propose, append or proof-retry one forward correction and refresh the result lineage it names. */
export const useMutateAccountingCorrectSwr = (scope: AccountingInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("accounting", "correct", scope) : null,
        (trigger: OperationTrigger<AccountingCorrectInput>) =>
            commandAccountingCorrect(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger, answer) => {
                const proposed = trigger.input.action === "propose" ? trigger.input.predecessorResultId : null
                const resultId = answer.ok ? answer.data.payload.resultId : proposed
                return resultId === null ? [] : [accountingResultDetailQueryKey(scope, { action: "current", resultId })]
            },
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
