import { pressCollabApprovalButton, type CollabApprovalDecision } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation"
import { useCollabRevalidate } from "./useCollabRevalidate"

/**
 * Press one exact button on one exact waiting card. `button` is a closed control
 * value - a typed message can never carry a decision - and the answer replays the
 * first recorded press on a repeated or competing press.
 */
export const useMutateCollabPressApprovalSwr = (workspaceId: string | null) => {
    const accessToken = useAccessToken()
    const revalidate = useCollabRevalidate(workspaceId, ["group", "tasks", "task", "notices", "notice"])
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "press", workspaceId]
    return useNivoMutation(key, (input: CollabPressApprovalInput) =>
        pressCollabApprovalButton({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(
            revalidate,
        ),
    )
}

/** One button press on one exact waiting approval card. */
type CollabPressApprovalInput = {
    readonly approvalId: string
    readonly button: CollabApprovalDecision
}
