import { changeCollabMemberRole, type CollabHumanRole } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation"
import { useCollabRevalidate } from "./useCollabRevalidate"

/** Replace one current member's role under a current Owner. */
export const useMutateCollabChangeMemberRoleSwr = (workspaceId: string | null) => {
    const accessToken = useAccessToken()
    const revalidate = useCollabRevalidate(workspaceId, ["office"])
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "member-role", workspaceId]
    return useNivoMutation(key, (input: CollabChangeMemberRoleInput) =>
        changeCollabMemberRole({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(
            revalidate,
        ),
    )
}

/** One member's replacement role. */
type CollabChangeMemberRoleInput = {
    readonly memberId: string
    readonly role: CollabHumanRole
}
