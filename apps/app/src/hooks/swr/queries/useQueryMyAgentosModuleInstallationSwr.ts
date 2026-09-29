"use client"
import { myAgentosModuleInstallation } from "@/modules/api/agentos-modules"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_MODULE_INSTALLATION_SWR_KEY } from "../swr.shared"

/** Read one module installation while retaining its workspace identity in the cache key. */
export const useQueryMyAgentosModuleInstallationSwr = (workspaceId: string, installationId: string) =>
    useNivoQuery(QUERY_AGENTOS_MODULE_INSTALLATION_SWR_KEY(workspaceId, installationId), () =>
        myAgentosModuleInstallation(installationId),
    )
