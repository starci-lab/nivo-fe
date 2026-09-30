import { reconcileChatbotDelivery } from "@/modules/api/workspace-controlplane"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_CHATBOT_RECONCILE_DELIVERY_SWR_KEY } from "../swr.shared"
import { type SupportQueryIdentity } from "../queries/queries.shared"
import { accepted, chatbotInvalidations } from "./mutations.shared"

/** Settle ambiguous evidence explicitly; this path never retries a provider send. */
export const useMutateReconcileChatbotDeliverySwr = (identity: SupportQueryIdentity) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? MUTATION_CHATBOT_RECONCILE_DELIVERY_SWR_KEY(identity.workspaceId, identity.installationId)
            : null,
        (input: Readonly<Record<string, unknown>>) =>
            reconcileChatbotDelivery(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input),
        {
            invalidates: chatbotInvalidations(identity),
            shouldInvalidate: accepted,
        },
    )
}
