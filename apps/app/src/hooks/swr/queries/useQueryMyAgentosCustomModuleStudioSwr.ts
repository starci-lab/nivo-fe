"use client"
import { myAgentosCustomModuleStudio } from "@/modules/api/agentos-module-studio"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"

/** Read the Studio projection for one custom module. */
export const useQueryMyAgentosCustomModuleStudioSwr = (workspaceId: string, moduleId: string) =>
    useNivoQuery(QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId), () =>
        myAgentosCustomModuleStudio(workspaceId, moduleId),
    )
