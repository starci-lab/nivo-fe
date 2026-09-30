import { postCollabMessage } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation"
import { useCollabRevalidate } from "./useCollabRevalidate"

/**
 * Post one Office message under its caller-owned stable intent identity. Covers the
 * group pages, every task projection and the notice views - a post can carry a card,
 * move a task's turn and raise a notice in one commit.
 */
export const useMutateCollabPostMessageSwr = (workspaceId: string | null) => {
    const accessToken = useAccessToken()
    const revalidate = useCollabRevalidate(workspaceId, ["group", "tasks", "task", "notices", "notice"])
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "post", workspaceId]
    return useNivoMutation(key, (input: CollabPostMessageInput) =>
        postCollabMessage({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(
            revalidate,
        ),
    )
}

/** One Office message to post; `intentId` is the caller-owned stable resend identity. */
type CollabPostMessageInput = {
    readonly intentId: string
    readonly body: string
    readonly moduleName?: string
    readonly answersQuestionId?: string
}
