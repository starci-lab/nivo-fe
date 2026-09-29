"use client"
import { listCollabTasks } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { type CollabTasksFilter, collabScope, QUERY_COLLAB_TASKS_SWR_KEY } from "../swr.shared"

/** Read one authorized Tasks page; filters select presentation, never a second grant. */
export const useQueryCollabTasksSwr = (workspaceId: string | null, filters?: CollabTasksFilter) => {
    const accessToken = useAccessToken()
    const scope = collabScope(accessToken, workspaceId)
    return useNivoQuery(scope === null ? null : QUERY_COLLAB_TASKS_SWR_KEY(scope.workspaceId, filters), () =>
        listCollabTasks({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "", ...(filters ?? {}) }),
    )
}
