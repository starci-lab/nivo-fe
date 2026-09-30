import { startChatbotZaloOauth } from "@/modules/api/workspace-controlplane"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_CHATBOT_ZALO_OAUTH_SWR_KEY } from "../swr.shared"
import { type SupportQueryIdentity } from "../queries/queries.shared"
import { accepted, chatbotInvalidations } from "./mutations.shared"

/** Begin the installation-qualified Zalo OAuth redirect handshake. */
export const useMutateStartChatbotZaloOauthSwr = (identity: SupportQueryIdentity) => {
    const accessToken = useAccessToken()
    return useNivoMutation(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? MUTATION_CHATBOT_ZALO_OAUTH_SWR_KEY(identity.workspaceId, identity.installationId)
            : null,
        (input: Readonly<Record<string, unknown>>) =>
            startChatbotZaloOauth(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input),
        {
            invalidates: chatbotInvalidations(identity),
            shouldInvalidate: accepted,
        },
    )
}
