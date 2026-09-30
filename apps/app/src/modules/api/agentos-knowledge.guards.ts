/**
 * The parsers of the AI-knowledge documents' payloads. Each returns the value or null, which
 * `graphql` reports as `unavailable`.
 */

import { isBoolean, isNullableString, isNumber, isRecord, isString, parseEach } from "@nivo/api"
import type { AgentosAiKnowledgeReadiness, AgentosAiOperationReceipt } from "./agentos-knowledge"

type ReadinessComponent = AgentosAiKnowledgeReadiness["components"][number]
type ReadinessOrigin = AgentosAiKnowledgeReadiness["origins"][number]

const parseComponent = (value: unknown): ReadinessComponent | null =>
    isRecord(value) && isString(value.component) && isString(value.verdict)
        ? { component: value.component, verdict: value.verdict }
        : null

const parseOrigin = (value: unknown): ReadinessOrigin | null =>
    isRecord(value) &&
    isString(value.origin) &&
    isNullableString(value.version) &&
    isNullableString(value.digest) &&
    isNumber(value.documentCount) &&
    isNullableString(value.lastUpdatedAt)
        ? {
              origin: value.origin,
              version: value.version,
              digest: value.digest,
              documentCount: value.documentCount,
              lastUpdatedAt: value.lastUpdatedAt,
          }
        : null

/** Parse the `data` of `myAgentosAiKnowledgeReadiness`. */
export const parseAgentosAiKnowledgeReadiness = (input: unknown): AgentosAiKnowledgeReadiness | null => {
    if (
        !isRecord(input) ||
        !isString(input.provider) ||
        !isString(input.chatModel) ||
        !isString(input.embeddingProfile) ||
        !isNumber(input.embeddingDimension) ||
        !isString(input.credentialStatus) ||
        !isNullableString(input.credentialMaskedHint) ||
        !isString(input.qdrantHealth) ||
        !isString(input.readinessStatus) ||
        !isBoolean(input.aiReady) ||
        !isNullableString(input.readinessOperationId) ||
        !isNullableString(input.knowledgeRecoveryOperationId) ||
        !isNullableString(input.failureCode) ||
        !isNullableString(input.testedAt)
    ) {
        return null
    }
    const components = parseEach(input.components, parseComponent)
    const origins = parseEach(input.origins, parseOrigin)
    if (components === null || origins === null) return null
    return {
        provider: input.provider,
        chatModel: input.chatModel,
        embeddingProfile: input.embeddingProfile,
        embeddingDimension: input.embeddingDimension,
        credentialStatus: input.credentialStatus,
        credentialMaskedHint: input.credentialMaskedHint,
        qdrantHealth: input.qdrantHealth,
        readinessStatus: input.readinessStatus,
        aiReady: input.aiReady,
        readinessOperationId: input.readinessOperationId,
        knowledgeRecoveryOperationId: input.knowledgeRecoveryOperationId,
        components,
        origins,
        failureCode: input.failureCode,
        testedAt: input.testedAt,
    }
}

/** Parse the `data` of `runAgentosAiReadinessTest`/`reindexAgentWorkspaceKnowledge`. */
export const parseAgentosAiOperationReceipt = (input: unknown): AgentosAiOperationReceipt | null =>
    isRecord(input) && isString(input.operationId) && isString(input.status)
        ? { operationId: input.operationId, status: input.status }
        : null
