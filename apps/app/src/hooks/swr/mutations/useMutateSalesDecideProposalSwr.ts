
import {
    commandSalesDecideProposal,
    type SalesDecideProposalRequest,
    type SalesInstallationScope,
} from "@/modules/api/sales"
import { operationMutationKey, operationAnswerNeedsRead, type OperationTrigger } from "@/modules/api/operation-route"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { salesDecisionRequestQueryKey } from "../queries/queries.shared"

/*
 * One hook per file, one registered command per hook.
 *
 * AN ANSWER IS SETTLED BY THE DECISION REQUEST IT ANSWERED, at the exact proposal version and
 * fingerprint the input carries, so the read that invalidates is that request and nothing else.
 */

/**
 * Answer one immutable proposal and refresh the decision request it answered.
 *
 * @param enabled - False while the installation scope is not yet resolved; a held command addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useMutateSalesDecideProposalSwr = (scope: SalesInstallationScope, enabled = true) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        enabled ? operationMutationKey("sales", "decide-proposal", scope) : null,
        (trigger: OperationTrigger<SalesDecideProposalRequest>) =>
            commandSalesDecideProposal(accessToken, scope, trigger.input, trigger.requestId),
        {
            invalidates: (trigger) => [
                salesDecisionRequestQueryKey(scope, { decisionRequestId: trigger.input.decisionRequestId }),
            ],
            shouldInvalidate: operationAnswerNeedsRead,
        },
    )
}
