import { bindChatbotChannel } from "@/modules/api/workspace-controlplane"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_CHATBOT_BIND_CHANNEL_SWR_KEY } from "../swr.shared"
import { type SupportQueryIdentity } from "../queries/queries.shared"
import { accepted, chatbotInvalidations } from "./mutations.shared"

/** Bind an already-sealed channel reference, then re-read only this installation. */
export const useMutateBindChatbotChannelSwr = (identity: SupportQueryIdentity) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? MUTATION_CHATBOT_BIND_CHANNEL_SWR_KEY(identity.workspaceId, identity.installationId)
            : null,
        (input: Readonly<Record<string, unknown>>) =>
            bindChatbotChannel(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input),
        {
            invalidates: chatbotInvalidations(identity),
            shouldInvalidate: accepted,
        },
    )
}
