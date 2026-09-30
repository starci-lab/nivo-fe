import { saveAgentosModuleIntegrationSecret } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_MODULE_INTEGRATION_SAVE_SWR_KEY, QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Replace one write-only module integration secret and refresh only its masked projection. */
export const useMutateSaveAgentosModuleIntegrationSecretSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_INTEGRATION_SAVE_SWR_KEY(workspaceId, moduleId),
        (input: SaveAgentosModuleIntegrationSecretCommand) =>
            saveAgentosModuleIntegrationSecret({
                agentWorkspaceId: workspaceId,
                moduleId,
                ...input,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

type SaveAgentosModuleIntegrationSecretCommand = {
    readonly providerKey: string
    readonly secret: string
}
