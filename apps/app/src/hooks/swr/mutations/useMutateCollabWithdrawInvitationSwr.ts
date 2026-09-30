import { withdrawCollabInvitation } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation"
import { useCollabRevalidate } from "./useCollabRevalidate"

/** Close one pending invitation; acceptance and withdrawal have one atomic winner. */
export const useMutateCollabWithdrawInvitationSwr = (workspaceId: string | null) => {
    const accessToken = useAccessToken()
    const revalidate = useCollabRevalidate(workspaceId, ["office"])
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "invite-withdraw", workspaceId]
    return useNivoMutation(key, (input: CollabWithdrawInvitationInput) =>
        withdrawCollabInvitation({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(
            revalidate,
        ),
    )
}

/** One pending invitation to close. */
type CollabWithdrawInvitationInput = { readonly invitationId: string }
