"use client"
import type { SWRConfiguration } from "swr"
import { myAgentosModuleRuntime, type AgentosModuleRuntime } from "@/modules/api/agentos-module-runtime"
import type { Outcome } from "@/modules/api/outcome"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_MODULE_RUNTIME_SWR_KEY } from "../swr.shared"

/** Read the operational runtime projection for one module installation. */
export const useQueryMyAgentosModuleRuntimeSwr = (
    workspaceId: string,
    installationId: string,
    includeDiagnostics: boolean,
    config?: SWRConfiguration<Outcome<AgentosModuleRuntime>, Error>,
) =>
    useNivoQuery(
        QUERY_AGENTOS_MODULE_RUNTIME_SWR_KEY(workspaceId, installationId, includeDiagnostics),
        () => myAgentosModuleRuntime(installationId, includeDiagnostics),
        config,
    )
