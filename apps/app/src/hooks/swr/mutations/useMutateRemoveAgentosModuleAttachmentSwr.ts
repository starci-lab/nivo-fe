import { removeAgentosModuleAttachment } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_MODULE_ATTACHMENT_REMOVE_SWR_KEY, QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Remove one module attachment through its exact workspace and module identity. */
export const useMutateRemoveAgentosModuleAttachmentSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_ATTACHMENT_REMOVE_SWR_KEY(workspaceId, moduleId),
        (attachmentId: string) =>
            removeAgentosModuleAttachment({
                agentWorkspaceId: workspaceId,
                moduleId,
                attachmentId,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )
