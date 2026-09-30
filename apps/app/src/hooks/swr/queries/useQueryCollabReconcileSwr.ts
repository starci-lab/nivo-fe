import { reconcileCollabRequest } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { collabScope, QUERY_COLLAB_RECONCILE_SWR_KEY } from "../swr.shared"

/**
 * Read the durable state of one intent before any resend (`contract.collab.chat`
 * consumer obligation): an intent that already matched is never resent. Null intent
 * mounts no read.
 */
export const useQueryCollabReconcileSwr = (workspaceId: string | null, intentId: string | null) => {
    const accessToken = useAccessToken()
    const scope = collabScope(accessToken, workspaceId)
    return useNivoQuery(
        scope === null || intentId === null ? null : QUERY_COLLAB_RECONCILE_SWR_KEY(scope.workspaceId, intentId),
        () =>
            reconcileCollabRequest({
                workspaceId: scope?.workspaceId ?? "",
                accessToken: accessToken ?? "",
                intentId: intentId ?? "",
            }),
    )
}
