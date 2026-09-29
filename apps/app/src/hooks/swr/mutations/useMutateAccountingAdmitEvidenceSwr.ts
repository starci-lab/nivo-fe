"use client"

import {
    commandAccountingAdmitEvidence,
    type AccountingAdmitEvidenceInput,
    type AccountingInstallationScope,
} from "@/modules/api/accounting"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { accountingEvidenceQueryKey } from "../queries/useQueryAccountingEvidenceSwr"

/* One hook per file, one registered command per hook. */

/** Admit one evidence item and refresh the evidence identity it names. */
export const useMutateAccountingAdmitEvidenceSwr = (scope: AccountingInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("accounting", "admit-evidence", scope) : null,
        (trigger: OperationTrigger<AccountingAdmitEvidenceInput>) =>
            commandAccountingAdmitEvidence(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [accountingEvidenceQueryKey(scope, { evidenceId: trigger.input.evidenceId })],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
