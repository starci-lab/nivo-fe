"use client"
import { readCollabNotices } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { collabScope, QUERY_COLLAB_NOTICES_SWR_KEY } from "../swr.shared"

/** Read the member's outstanding turn notices; polls only when the caller passes the fallback interval of a lost channel. */
export const useQueryCollabNoticesSwr = (workspaceId: string | null, cursor?: string | null, refreshInterval = 0) => {
    const accessToken = useAccessToken()
    const scope = collabScope(accessToken, workspaceId)
    return useNivoQuery(
        scope === null ? null : QUERY_COLLAB_NOTICES_SWR_KEY(scope.workspaceId, cursor),
        () =>
            readCollabNotices({
                workspaceId: scope?.workspaceId ?? "",
                accessToken: accessToken ?? "",
                ...(cursor == null ? {} : { cursor }),
            }),
        { refreshInterval },
    )
}
