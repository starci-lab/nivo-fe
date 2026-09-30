import { finalizeAgentosModuleAttachment } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_MODULE_ATTACHMENT_FINALIZE_SWR_KEY, QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Retry ingestion for one quarantined module attachment. */
export const useMutateFinalizeAgentosModuleAttachmentSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_ATTACHMENT_FINALIZE_SWR_KEY(workspaceId, moduleId),
        (attachmentId: string) =>
            finalizeAgentosModuleAttachment({
                agentWorkspaceId: workspaceId,
                moduleId,
                attachmentId,
            }),
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )
