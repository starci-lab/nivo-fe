"use client"
import { readCollabAvailableCommands } from "@/modules/api/collab"
import { useAccessToken } from "../../auth/useAccessToken"
import { useNivoQuery } from "../useNivoQuery"
import { collabScope, QUERY_COLLAB_COMMANDS_SWR_KEY } from "../swr.shared"

/** Resolve one typed `@` name to its published commands; null name mounts no read. */
export const useQueryCollabCommandsSwr = (workspaceId: string | null, moduleName: string | null) => {
    const accessToken = useAccessToken()
    const scope = collabScope(accessToken, workspaceId)
    return useNivoQuery(
        scope === null || moduleName === null || moduleName === ""
            ? null
            : QUERY_COLLAB_COMMANDS_SWR_KEY(scope.workspaceId, moduleName),
        () =>
            readCollabAvailableCommands({
                workspaceId: scope?.workspaceId ?? "",
                accessToken: accessToken ?? "",
                moduleName: moduleName ?? "",
            }),
    )
}
