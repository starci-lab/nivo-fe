"use client"

import { chatbotWorkbench } from "@/modules/api/workspace-controlplane"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"

/** Exact workspace/module controller identity required by support projections. */
export type SupportQueryIdentity = {
    readonly hostname: string | null
    readonly workspaceId: string
    readonly installationId: string
    readonly enabled: boolean
}

/** Cache identity for the complete state of one installed Chatbot. */
export const chatbotWorkbenchQueryKey = (identity: SupportQueryIdentity) =>
    ["chatbot", "workbench", identity.hostname, identity.workspaceId, identity.installationId] as const

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
