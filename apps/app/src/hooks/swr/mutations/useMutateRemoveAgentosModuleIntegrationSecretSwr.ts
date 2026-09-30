import { removeAgentosModuleIntegrationSecret } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_MODULE_INTEGRATION_REMOVE_SWR_KEY, QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Remove one module integration secret and refresh only its masked projection. */
export const useMutateRemoveAgentosModuleIntegrationSecretSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_INTEGRATION_REMOVE_SWR_KEY(workspaceId, moduleId),
        (providerKey: string) =>
            removeAgentosModuleIntegrationSecret({
                agentWorkspaceId: workspaceId,
                moduleId,
                providerKey,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )
