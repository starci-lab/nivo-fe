import { describe, expect, it } from "vitest"

import { parseAgentosAiKnowledgeReadiness, parseAgentosAiOperationReceipt } from "./agentos-knowledge.guards"

describe("parseAgentosAiKnowledgeReadiness", () => {
    it("refuses a malformed payload: a wrong primitive or a malformed nested origin", () => {
        expect(
            parseAgentosAiKnowledgeReadiness({
                provider: "openai",
                chatModel: "gpt",
                embeddingProfile: "p",
                embeddingDimension: 1536,
                credentialStatus: "configured",
                credentialMaskedHint: "sk-…",
                qdrantHealth: "healthy",
                readinessStatus: "ready",
                aiReady: true,
                readinessOperationId: null,
                knowledgeRecoveryOperationId: null,
                components: [{ component: "embedding", verdict: "ok" }],
                origins: [{ origin: "module", version: null, digest: null, documentCount: 0, lastUpdatedAt: null }],
                failureCode: null,
                testedAt: "t",
            }),
        ).not.toBeNull()
        expect(parseAgentosAiKnowledgeReadiness({})).toBeNull()
        expect(
            parseAgentosAiKnowledgeReadiness({
                provider: "openai",
                chatModel: "gpt",
                embeddingProfile: "p",
                embeddingDimension: "wide",
                credentialStatus: "configured",
                credentialMaskedHint: null,
                qdrantHealth: "healthy",
                readinessStatus: "ready",
                aiReady: true,
                readinessOperationId: null,
                knowledgeRecoveryOperationId: null,
                components: [],
                origins: [],
                failureCode: null,
                testedAt: null,
            }),
        ).toBeNull()
    })
})

describe("parseAgentosAiOperationReceipt", () => {
    it("refuses a receipt without an operation identity", () => {
        expect(parseAgentosAiOperationReceipt({ operationId: "op-1", status: "queued" })).not.toBeNull()
        expect(parseAgentosAiOperationReceipt({ status: "queued" })).toBeNull()
        expect(parseAgentosAiOperationReceipt(true)).toBeNull()
    })
})
