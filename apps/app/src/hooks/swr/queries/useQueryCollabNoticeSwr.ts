"use client"
import { openCollabNotice } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { collabScope, QUERY_COLLAB_NOTICE_SWR_KEY } from "../swr.shared"

/** Follow one named notice to its live authoritative target; null notice mounts no read. */
export const useQueryCollabNoticeSwr = (workspaceId: string | null, noticeId: string | null) => {
    const accessToken = useAccessToken()
    const scope = collabScope(accessToken, workspaceId)
    return useNivoQuery(
        scope === null || noticeId === null ? null : QUERY_COLLAB_NOTICE_SWR_KEY(scope.workspaceId, noticeId),
        () =>
            openCollabNotice({
                workspaceId: scope?.workspaceId ?? "",
                accessToken: accessToken ?? "",
                noticeId: noticeId ?? "",
            }),
    )
}
