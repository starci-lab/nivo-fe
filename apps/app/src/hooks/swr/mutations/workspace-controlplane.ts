"use client"

import {
    approveSupportReply,
    reconcileSupportDelivery,
    setSupportTakeover,
} from "@/modules/api/workspace-controlplane"
import { useSession } from "@/modules/auth/session"
import { useNivoMutation } from "../use-nivo-mutation"
import {
    supportConversationsQueryKey,
    supportImportantFactsQueryKey,
    supportMessagesQueryKey,
    supportTicketsQueryKey,
    type SupportQueryIdentity,
} from "../queries/workspace-controlplane"

type SupportMutationIdentity = SupportQueryIdentity & {
    readonly conversationId: string | null
}

type AcceptedAnswer = { readonly ok: boolean }

const accepted = (answer: AcceptedAnswer) => answer.ok

const useSupportAccessToken = (): string | null => {
    const session = useSession()
    return session.state.status === "signed-in" ? session.state.accessToken : null
}

const supportInvalidations = (identity: SupportMutationIdentity) => [
    supportConversationsQueryKey(identity),
    supportTicketsQueryKey(identity),
    supportImportantFactsQueryKey(identity),
    ...(identity.conversationId === null
        ? []
        : [supportMessagesQueryKey(identity, identity.conversationId)]),
]

/** Approve one AI reply while keeping credentials and support cache ownership out of the page. */
export const useMutateApproveSupportReplySwr = (identity: SupportMutationIdentity) => {
    const accessToken = useSupportAccessToken()
    return useNivoMutation(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? ["support", "approve-reply", identity.workspaceId, identity.installationId]
            : null,
        (decisionId: string) => approveSupportReply(
            identity.hostname ?? "", identity.workspaceId, accessToken ?? "", decisionId,
        ),
        { invalidates: supportInvalidations(identity), shouldInvalidate: accepted },
    )
}

type SupportTakeoverCommand = { readonly conversationId: string, readonly takeover: boolean }

/** Toggle human takeover for one customer conversation. */
export const useMutateSetSupportTakeoverSwr = (identity: SupportMutationIdentity) => {
    const accessToken = useSupportAccessToken()
    return useNivoMutation(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? ["support", "set-takeover", identity.workspaceId, identity.installationId]
            : null,
        (input: SupportTakeoverCommand) => setSupportTakeover(
            identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input.conversationId, input.takeover,
        ),
        { invalidates: supportInvalidations(identity), shouldInvalidate: accepted },
    )
}

type SupportDeliveryCommand = { readonly outboxId: string, readonly delivered: boolean }

/** Reconcile one provider delivery outcome and refresh the exact support projections. */
export const useMutateReconcileSupportDeliverySwr = (identity: SupportMutationIdentity) => {
    const accessToken = useSupportAccessToken()
    return useNivoMutation(
        identity.enabled && identity.hostname !== null && accessToken !== null
            ? ["support", "reconcile-delivery", identity.workspaceId, identity.installationId]
            : null,
        (input: SupportDeliveryCommand) => reconcileSupportDelivery(
            identity.hostname ?? "", identity.workspaceId, accessToken ?? "", input.outboxId, input.delivered,
        ),
        { invalidates: supportInvalidations(identity), shouldInvalidate: accepted },
    )
}
