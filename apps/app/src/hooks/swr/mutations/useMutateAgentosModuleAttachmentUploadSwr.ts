import { finalizeAgentosModuleAttachment, prepareAgentosModuleAttachmentUpload, uploadAgentosModuleAttachment } from "@/modules/api/agentos-module-studio"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_MODULE_ATTACHMENT_UPLOAD_SWR_KEY, QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Execute the three-step capability upload without exposing transport sequencing to a component. */
export const useMutateAgentosModuleAttachmentUploadSwr = (workspaceId: string, moduleId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_MODULE_ATTACHMENT_UPLOAD_SWR_KEY(workspaceId, moduleId),
        async ({ file, mediaType }: AgentosModuleAttachmentUploadCommand) => {
            const prepared = await prepareAgentosModuleAttachmentUpload({
                agentWorkspaceId: workspaceId,
                moduleId,
                fileName: file.name,
                mediaType,
                sizeBytes: file.size,
            })
            if (!prepared.ok) return prepared
            const uploaded = await uploadAgentosModuleAttachment(prepared.data, mediaType, file)
            if (!uploaded.ok) return uploaded
            return finalizeAgentosModuleAttachment({
                agentWorkspaceId: workspaceId,
                moduleId,
                attachmentId: prepared.data.attachmentId,
            })
        },
        {
            invalidates: [QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId)],
            shouldInvalidate: accepted,
        },
    )

type AgentosModuleAttachmentUploadCommand = {
    readonly file: File
    readonly mediaType: string
}
