import { runAgentosAiReadinessTest } from "@/modules/api/agentos-knowledge"
import { useNivoMutation } from "../useNivoMutation"
import { MUTATION_AGENTOS_AI_READINESS_TEST_SWR_KEY, QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY } from "../swr.shared"
import { accepted } from "./mutations.shared"

/** Start a bounded provider, vector-store and retrieval readiness test. */
export const useMutateRunAgentosAiReadinessTestSwr = (workspaceId?: string) =>
    useNivoMutation(
        workspaceId === undefined ? null : MUTATION_AGENTOS_AI_READINESS_TEST_SWR_KEY(workspaceId),
        (idempotencyKey: string) =>
            runAgentosAiReadinessTest({
                workspaceId: workspaceId ?? "",
                idempotencyKey,
            }),
        {
            invalidates: workspaceId === undefined ? [] : [QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY(workspaceId)],
            shouldInvalidate: accepted,
        },
    )
