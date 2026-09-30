import { resolveChatbotHandoff } from "@/modules/api/workspace-controlplane"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_CHATBOT_RESOLVE_HANDOFF_SWR_KEY } from "../swr.shared"
import { type SupportQueryIdentity } from "../queries/queries.shared"
import { accepted, chatbotInvalidations } from "./mutations.shared"

/** Return a human-owned conversation to automation through explicit authority. */
export const useMutateResolveChatbotHandoffSwr = (identity: SupportQueryIdentity) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? MUTATION_CHATBOT_RESOLVE_HANDOFF_SWR_KEY(identity.workspaceId, identity.installationId)
            : null,
        (input: Readonly<Record<string, unknown>>) =>
            resolveChatbotHandoff(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input),
        {
            invalidates: chatbotInvalidations(identity),
            shouldInvalidate: accepted,
        },
    )
}
