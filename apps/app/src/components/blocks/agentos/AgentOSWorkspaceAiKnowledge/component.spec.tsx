import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspaceAiKnowledgeBase } from "./component"

const labels = { title: "AI & Knowledge", description: "Workspace readiness", ready: "AI ready", testing: "Testing", refused: "Needs attention", provider: "Provider", model: "Model", embedding: "Embedding", qdrant: "Qdrant", credential: "Credential", testedAt: "Tested", runTest: "Run test", recover: "Recover", origins: "Origins", components: "Components", evidence: "Verdict", documents: (count: number) => `${count} documents`, current: "Current", unknownVersion: "Pending", formatTestedAt: (value: string) => value }
const readiness = { provider: "OpenRouter", chatModel: "deepseek/deepseek-chat", embeddingProfile: "nivo-embedding-v1", embeddingDimension: 1024, credentialStatus: "configured", credentialMaskedHint: "or-…7a", qdrantHealth: "healthy", readinessStatus: "ready", aiReady: true, readinessOperationId: null, knowledgeRecoveryOperationId: null, components: [{ component: "provider", verdict: "ready" }], origins: [{ origin: "Nivo module", version: "v1", digest: "abc123abc123abc123", documentCount: 3, lastUpdatedAt: null }], failureCode: null, testedAt: "2026-08-23T00:00:00.000Z" }

describe("AgentOSWorkspaceAiKnowledgeBase", () => {
    it("renders the ready verdict, provenance, evidence and both bounded actions", () => {
        const html = renderToStaticMarkup(<AgentOSWorkspaceAiKnowledgeBase state="ready" readiness={readiness} labels={labels} onTest={vi.fn()} onRecover={vi.fn()} />)
        expect(html).toContain("OpenRouter")
        expect(html).toContain("deepseek/deepseek-chat")
        expect(html).toContain("Nivo module")
        expect(html).toContain("Run test")
        expect(html).toContain("Recover")
    })
})
