import { inviteCollabMemberByEmail, type CollabHumanRole } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation"
import { useCollabRevalidate } from "./useCollabRevalidate"

/**
 * Invite one person by email into exactly one V1 human role. Only a current Owner or
 * Manager's invite records; the boundary normalizes the email and answers `created`
 * or `existing` under the `membership` result field.
 */
export const useMutateCollabInviteByEmailSwr = (workspaceId: string | null) => {
    const accessToken = useAccessToken()
    const revalidate = useCollabRevalidate(workspaceId, ["office"])
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "invite", workspaceId]
    return useNivoMutation(key, (input: CollabInviteByEmailInput) =>
        inviteCollabMemberByEmail({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(
            revalidate,
        ),
    )
}

/**
 * One email invitation into exactly one V1 human role (`fr.collab.roles-invite` rev 2,
 * `contract.collab.member-invite` rev 4). The email names the invitee only; no phone
 * exists in this layer and the actor's identity never rides the input.
 */
type CollabInviteByEmailInput = {
    readonly email: string
    readonly role: CollabHumanRole
}
