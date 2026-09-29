"use client"
import { myAgentosAiKnowledgeReadiness } from "@/modules/api/agentos-knowledge"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY } from "../swr.shared"

/** Read and, while an operation is active, poll workspace AI-knowledge readiness. */
export const useQueryMyAgentosAiKnowledgeReadinessSwr = (workspaceId?: string, operationInFlight = false) =>
    useNivoQuery(
        workspaceId === undefined ? null : QUERY_AGENTOS_AI_KNOWLEDGE_SWR_KEY(workspaceId),
        () => myAgentosAiKnowledgeReadiness(workspaceId ?? ""),
        {
            refreshInterval: (latest) =>
                operationInFlight || (latest?.ok === true && latest.data.readinessStatus === "testing") ? 2_000 : 0,
        },
    )

/** Provisioning and Academy reads. */
