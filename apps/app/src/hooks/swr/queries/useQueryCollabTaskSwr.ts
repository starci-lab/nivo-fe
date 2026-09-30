import { readCollabTask } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { collabScope, QUERY_COLLAB_TASK_SWR_KEY } from "../swr.shared"

/** Read one task the Tasks row and the Office card share - the same authoritative row. */
export const useQueryCollabTaskSwr = (workspaceId: string | null, taskId: string | null) => {
    const accessToken = useAccessToken()
    const scope = collabScope(accessToken, workspaceId)
    return useNivoQuery(scope === null || taskId === null ? null : QUERY_COLLAB_TASK_SWR_KEY(scope.workspaceId, taskId), () =>
        readCollabTask({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", taskId: taskId ?? "" }),
    )
}
