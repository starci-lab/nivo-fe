/**
 * The workspace-private AI knowledge: provider, model and Qdrant readiness evidence and its recovery.
 *
 * Every operation selects exactly one root field (`graphql` reads the first one and no more), returns an
 * `Outcome` and never throws; a caller keys its sentence off `code`, never off the server's English `reason`.
 * The nullability of every type is the schema's, not a guess.
 */

import type { Outcome } from "./outcome";
import { graphql } from "./graphql";

/** Owner-safe AI, vector-store and knowledge provenance for one workspace. */
export type AgentosAiKnowledgeReadiness = {
  readonly provider: string;
  readonly chatModel: string;
  readonly embeddingProfile: string;
  readonly embeddingDimension: number;
  readonly credentialStatus: string;
  readonly credentialMaskedHint: string | null;
  readonly qdrantHealth: string;
  readonly readinessStatus: string;
  readonly aiReady: boolean;
  readonly readinessOperationId: string | null;
  readonly knowledgeRecoveryOperationId: string | null;
  readonly components: ReadonlyArray<{
    readonly component: string;
    readonly verdict: string;
  }>;
  readonly origins: ReadonlyArray<{
    readonly origin: string;
    readonly version: string | null;
    readonly digest: string | null;
    readonly documentCount: number;
    readonly lastUpdatedAt: string | null;
  }>;
  readonly failureCode: string | null;
  readonly testedAt: string | null;
};

/** Receipt for one bounded AI readiness or knowledge recovery operation. */
export type AgentosAiOperationReceipt = {
  readonly operationId: string;
  readonly status: string;
};

/** Input shared by bounded workspace AI readiness and knowledge recovery operations. */
export type AgentosAiOperationInput = {
  readonly workspaceId: string;
  readonly idempotencyKey: string;
};

/** Read current per-workspace provider, model, global-Qdrant recovery and readiness evidence. */
export const myAgentosAiKnowledgeReadiness = (workspaceId: string): Promise<Outcome<AgentosAiKnowledgeReadiness>> => graphql(`query MyAgentosAiKnowledgeReadiness($request: MyAgentosAiKnowledgeReadinessRequest!) {
            myAgentosAiKnowledgeReadiness(request: $request) {
                data {
                    provider chatModel embeddingProfile embeddingDimension
                    credentialStatus credentialMaskedHint qdrantHealth readinessStatus aiReady
                    readinessOperationId knowledgeRecoveryOperationId failureCode testedAt
                    components { component verdict }
                    origins { origin version digest documentCount lastUpdatedAt }
                }
                message success error
            }
        }`, {
  request: { workspaceId }
});

/** Ask the backend to run one bounded provider, Qdrant and retrieval readiness test. */
export const runAgentosAiReadinessTest = (input: AgentosAiOperationInput): Promise<Outcome<AgentosAiOperationReceipt>> => graphql(`mutation RunAgentosAiReadinessTest($input: RunAgentosAiReadinessTestInput!) {
            runAgentosAiReadinessTest(request: $input) { data { operationId status } message success error }
        }`, {
  input
});

/** Recover the workspace-private Qdrant collection from pinned Nivo/module knowledge snapshots. */
export const reindexAgentWorkspaceKnowledge = (input: AgentosAiOperationInput): Promise<Outcome<AgentosAiOperationReceipt>> => graphql(`mutation ReindexAgentWorkspaceKnowledge($input: ReindexAgentWorkspaceKnowledgeInput!) {
            reindexAgentWorkspaceKnowledge(request: $input) { data { operationId status } message success error }
        }`, {
  input
});
