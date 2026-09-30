import { chatbotWorkbench } from "@/modules/api/workspace-controlplane"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { type SupportQueryIdentity, chatbotWorkbenchQueryKey } from "./queries.shared"

/** Poll one installation-qualified Chatbot workbench without sharing sibling cache state. */
export const useQueryChatbotWorkbenchSwr = (identity: SupportQueryIdentity) => {
    const accessToken = useAccessToken()
    return useNivoQuery(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? chatbotWorkbenchQueryKey(identity)
            : null,
        () =>
            chatbotWorkbench(identity.hostname ?? "", identity.workspaceId, accessToken ?? "", identity.installationId),
        {
            refreshInterval: identity.enabled ? 3_000 : 0,
        },
    )
}
