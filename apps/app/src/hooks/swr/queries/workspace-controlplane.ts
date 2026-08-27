"use client"

import {
    supportCustomerConversations,
    supportCustomerMessages,
    supportImportantFacts,
    supportTickets,
} from "@/modules/api/workspace-controlplane"
import { useSession } from "@/modules/auth/session"
import { useNivoQuery } from "../use-nivo-query"

/** Exact workspace/module controller identity required by support projections. */
export type SupportQueryIdentity = {
    readonly hostname: string | null
    readonly workspaceId: string
    readonly installationId: string
    readonly enabled: boolean
}

/** Cache identity for one module's external customer conversations. */
export const supportConversationsQueryKey = (identity: SupportQueryIdentity) => [
    "support", "conversations", identity.workspaceId, identity.installationId,
] as const
/** Cache identity for one module's durable support ticket queue. */
export const supportTicketsQueryKey = (identity: SupportQueryIdentity) => [
    "support", "tickets", identity.workspaceId, identity.installationId,
] as const
/** Cache identity for important facts extracted by one support module. */
export const supportImportantFactsQueryKey = (identity: SupportQueryIdentity) => [
    "support", "facts", identity.workspaceId, identity.installationId,
] as const
/** Cache identity for one selected external customer conversation. */
export const supportMessagesQueryKey = (workspaceId: string, conversationId: string) => [
    "support", "messages", workspaceId, conversationId,
] as const

const useSupportAccessToken = (): string | null => {
    const session = useSession()
    return session.state.status === "signed-in" ? session.state.accessToken : null
}

/** Poll the owner-scoped support inbox while the operations pane is active. */
export const useQuerySupportCustomerConversationsSwr = (identity: SupportQueryIdentity) => {
    const accessToken = useSupportAccessToken()
    return useNivoQuery(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? supportConversationsQueryKey(identity)
            : null,
        () => supportCustomerConversations(
            identity.hostname ?? "",
            identity.workspaceId,
            accessToken ?? "",
            identity.installationId,
        ),
        { refreshInterval: identity.enabled ? 5_000 : 0 },
    )
}

/** Poll the module's task queue independently from conversation history. */
export const useQuerySupportTicketsSwr = (identity: SupportQueryIdentity) => {
    const accessToken = useSupportAccessToken()
    return useNivoQuery(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? supportTicketsQueryKey(identity)
            : null,
        () => supportTickets(
            identity.hostname ?? "",
            identity.workspaceId,
            accessToken ?? "",
            identity.installationId,
        ),
        { refreshInterval: identity.enabled ? 5_000 : 0 },
    )
}

/** Poll extracted business facts independently so one refused panel does not blank the inbox. */
export const useQuerySupportImportantFactsSwr = (identity: SupportQueryIdentity) => {
    const accessToken = useSupportAccessToken()
    return useNivoQuery(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? supportImportantFactsQueryKey(identity)
            : null,
        () => supportImportantFacts(
            identity.hostname ?? "",
            identity.workspaceId,
            accessToken ?? "",
            identity.installationId,
        ),
        { refreshInterval: identity.enabled ? 5_000 : 0 },
    )
}

/** Poll only the selected external conversation; selection remains route-block interaction state. */
export const useQuerySupportCustomerMessagesSwr = (
    hostname: string | null,
    workspaceId: string,
    conversationId: string | null,
    enabled: boolean,
) => {
    const accessToken = useSupportAccessToken()
    return useNivoQuery(
        enabled && hostname !== null && conversationId !== null && accessToken !== null
            ? supportMessagesQueryKey(workspaceId, conversationId)
            : null,
        () => supportCustomerMessages(hostname ?? "", workspaceId, accessToken ?? "", conversationId ?? ""),
        { refreshInterval: enabled ? 3_000 : 0 },
    )
}
