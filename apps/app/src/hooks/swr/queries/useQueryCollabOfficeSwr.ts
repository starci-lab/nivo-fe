import { openCollabOffice } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { collabScope, QUERY_COLLAB_OFFICE_SWR_KEY } from "../swr.shared"

/** Read the one Office landing bundle: group plus current humans and hired modules. */
export const useQueryCollabOfficeSwr = (workspaceId: string | null) => {
    const accessToken = useAccessToken()
    const scope = collabScope(accessToken, workspaceId)
    return useNivoQuery(scope === null ? null : QUERY_COLLAB_OFFICE_SWR_KEY(scope.workspaceId), () =>
        openCollabOffice({ workspaceId: scope?.workspaceId ?? "", accessToken: accessToken ?? "" }),
    )
}
