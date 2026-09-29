"use client"
import { myAgentosModuleInstallations } from "@/modules/api/agentos-modules"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY } from "../swr.shared"

/** Read all module installations in one workspace. */
export const useQueryMyAgentosModuleInstallationsSwr = (workspaceId: string) =>
    useNivoQuery(QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY(workspaceId), () => myAgentosModuleInstallations(workspaceId))
