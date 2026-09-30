import { myAgentosCustomModuleStudio } from "@/modules/api/agentos-module-studio"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY } from "../swr.shared"

/** What a caller may ask of the Studio read beyond its identity. */
type ModuleStudioReadOptions = {
    /** Re-read every two seconds while any attachment is still being scanned or ingested. */
    readonly pollAttachments?: boolean
}

/** How long an attachment still in flight waits before the projection is read again. */
const ATTACHMENT_POLL_MS = 2_000

/** Read the Studio projection for one custom module. */
export const useQueryMyAgentosCustomModuleStudioSwr = (
    workspaceId: string,
    moduleId: string,
    options?: ModuleStudioReadOptions,
) =>
    useNivoQuery(
        QUERY_AGENTOS_MODULE_STUDIO_SWR_KEY(workspaceId, moduleId),
        () => myAgentosCustomModuleStudio(workspaceId, moduleId),
        options?.pollAttachments === true
            ? {
                  refreshInterval: (answer) =>
                      answer?.ok === true &&
                      answer.data.attachments.some(
                          (item) =>
                              item.status === "scanning" ||
                              item.ingestionStatus === "extracting" ||
                              item.ingestionStatus === "embedding" ||
                              item.ingestionStatus === "indexing",
                      )
                          ? ATTACHMENT_POLL_MS
                          : 0,
              }
            : undefined,
    )
