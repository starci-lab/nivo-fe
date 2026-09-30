/**
 * The workspace-private AI knowledge: provider, model and Qdrant readiness evidence and its recovery.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import { type Outcome } from "@nivo/api"
import { graphql } from "./graphql"
import {
    MyAgentosAiKnowledgeReadinessDocument,
    ReindexAgentWorkspaceKnowledgeDocument,
    RunAgentosAiReadinessTestDocument,
} from "./__generated__/core"
import type {
    MyAgentosAiKnowledgeReadinessQuery,
    ReindexAgentWorkspaceKnowledgeInput,
    ReindexAgentWorkspaceKnowledgeMutation,
    RunAgentosAiReadinessTestInput,
    RunAgentosAiReadinessTestMutation,
} from "./__generated__/core"
import {
    parseAgentosAiKnowledgeReadiness,
    parseAgentosAiReadinessTestReceipt,
    parseAgentosKnowledgeReindexReceipt,
} from "./agentos-knowledge.guards"

/** Read current per-workspace provider, model, global-Qdrant recovery and readiness evidence. */
export const myAgentosAiKnowledgeReadiness = (
    workspaceId: string,
): Promise<Outcome<NonNullable<MyAgentosAiKnowledgeReadinessQuery["myAgentosAiKnowledgeReadiness"]["data"]>>> =>
    graphql(
        MyAgentosAiKnowledgeReadinessDocument,
        parseAgentosAiKnowledgeReadiness,
        {
            request: { workspaceId },
        },
    )

/** Ask the backend to run one bounded provider, Qdrant and retrieval readiness test. */
export const runAgentosAiReadinessTest = (
    input: RunAgentosAiReadinessTestInput,
): Promise<Outcome<NonNullable<RunAgentosAiReadinessTestMutation["runAgentosAiReadinessTest"]["data"]>>> =>
    graphql(
        RunAgentosAiReadinessTestDocument,
        parseAgentosAiReadinessTestReceipt,
        {
            input,
        },
    )

/** Recover the workspace-private Qdrant collection from pinned Nivo/module knowledge snapshots. */
export const reindexAgentWorkspaceKnowledge = (
    input: ReindexAgentWorkspaceKnowledgeInput,
): Promise<Outcome<NonNullable<ReindexAgentWorkspaceKnowledgeMutation["reindexAgentWorkspaceKnowledge"]["data"]>>> =>
    graphql(
        ReindexAgentWorkspaceKnowledgeDocument,
        parseAgentosKnowledgeReindexReceipt,
        {
            input,
        },
    )
