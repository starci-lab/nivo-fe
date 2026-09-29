"use client"
import { readCollabGroup } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { collabScope, QUERY_COLLAB_GROUP_SWR_KEY } from "../swr.shared"

/**
 * Read one authorized conversation page. The live channel is a hint, this authoritative page is the
 * truth (`br.collab.reads-cheap`); it polls only when the caller passes the fallback interval of a
 * lost channel.
 */
export const useQueryCollabGroupSwr = (workspaceId: string | null, cursor?: string | null, refreshInterval = 0) => {
    const accessToken = useAccessToken()
    const scope = collabScope(accessToken, workspaceId)
    return useNivoQuery(
        scope === null ? null : QUERY_COLLAB_GROUP_SWR_KEY(scope.workspaceId, cursor),
        () =>
            readCollabGroup({
                workspaceId: scope?.workspaceId ?? "",
                accessToken: accessToken ?? "",
                ...(cursor == null ? {} : { cursor }),
            }),
        { refreshInterval },
    )
}
