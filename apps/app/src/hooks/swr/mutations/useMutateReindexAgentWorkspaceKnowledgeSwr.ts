import { reindexAgentWorkspaceKnowledge } from "@/modules/api/agentos-knowledge"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_AI_KNOWLEDGE_REINDEX_SWR_KEY, QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Start rebuilding the workspace-private knowledge index. */
export const useMutateReindexAgentWorkspaceKnowledgeSwr = (workspaceId: string) =>
    useNivoMutation(
        MUTATION_AGENTOS_AI_KNOWLEDGE_REINDEX_SWR_KEY(workspaceId),
        (idempotencyKey: string) =>
            reindexAgentWorkspaceKnowledge({
                workspaceId,
                idempotencyKey,
            }),
        {
            invalidates: [QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY(workspaceId)],
            shouldInvalidate: accepted,
        },
    )
