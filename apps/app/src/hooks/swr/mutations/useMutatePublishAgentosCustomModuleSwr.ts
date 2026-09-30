import { publishAgentosCustomModule } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_CUSTOM_MODULE_PUBLISH_SWR_KEY, QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY, QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Publish one acknowledged custom-module specification and refresh its workspace projections. */
export const useMutatePublishAgentosCustomModuleSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_CUSTOM_MODULE_PUBLISH_SWR_KEY(workspaceId, moduleId),
        (input: PublishAgentosCustomModuleCommand) =>
            publishAgentosCustomModule({
                agentWorkspaceId: workspaceId,
                moduleId,
                ...input,
            }),
        {
            invalidates: [
                QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId),
                QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY(workspaceId),
            ],
            shouldInvalidate: accepted,
        },
    )

type PublishAgentosCustomModuleCommand = {
    readonly acknowledgedVersion: number
    readonly idempotencyKey: string
}
