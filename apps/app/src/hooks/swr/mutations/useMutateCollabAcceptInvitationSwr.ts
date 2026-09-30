import { acceptCollabInvitation } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation"
import { useCollabRevalidate } from "./useCollabRevalidate"

/**
 * Consume one invitation with the invited person's authenticated session. The input
 * carries only the invitation identity (plus an optional display name) - the matching
 * Login-verified email comes from the bearer, never from this call.
 */
export const useMutateCollabAcceptInvitationSwr = (workspaceId: string | null) => {
    const accessToken = useAccessToken()
    const revalidate = useCollabRevalidate(workspaceId, ["office"])
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "invite-accept", workspaceId]
    return useNivoMutation(key, (input: CollabAcceptInvitationInput) =>
        acceptCollabInvitation({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(
            revalidate,
        ),
    )
}

/** One invitation consumed by the invited person. */
type CollabAcceptInvitationInput = {
    readonly invitationId: string
    readonly displayName?: string
}
