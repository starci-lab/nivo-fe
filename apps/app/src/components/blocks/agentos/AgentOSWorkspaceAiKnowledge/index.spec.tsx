import { describe, expect, it } from "vitest"
import { meta, resolveAgentOSWorkspaceAiKnowledgeAction, resolveAgentOSWorkspaceAiKnowledgeState } from "./"

const ready = {
    provider: "openrouter", chatModel: "deepseek/deepseek-v4-flash", embeddingProfile: "nivo-qwen3-embedding-8b-4096-v1", embeddingDimension: 4096,
    credentialStatus: "configured", credentialMaskedHint: null, qdrantHealth: "healthy", readinessStatus: "ready", aiReady: true,
    readinessOperationId: "readiness-operation", knowledgeRecoveryOperationId: "recovery-operation", components: [], origins: [], failureCode: null,
    testedAt: "2026-08-25T00:00:00.000Z",
}

describe("AgentOSWorkspaceAiKnowledge connected owner", () => {
    it("keeps the approved connected block boundary", () => {
        expect(meta).toEqual({ shape: "block", world: "connected" })
    })

    it("treats terminal operation ids as provenance instead of active work", () => {
        expect(resolveAgentOSWorkspaceAiKnowledgeState(ready, null, false)).toBe("ready")
    })

    it("keeps only the operation started by this page visibly active", () => {
        expect(resolveAgentOSWorkspaceAiKnowledgeState(ready, { kind: "testing", operationId: "readiness-operation" }, false)).toBe("testing")
        expect(resolveAgentOSWorkspaceAiKnowledgeState(ready, { kind: "recovering", operationId: "recovery-operation" }, false)).toBe("recovering")
        expect(resolveAgentOSWorkspaceAiKnowledgeState(ready, { kind: "success", operationId: null }, false)).toBe("success")
    })

    it("finishes the matching server operation while retaining historical provenance", () => {
        expect(resolveAgentOSWorkspaceAiKnowledgeAction({ kind: "testing", operationId: "readiness-operation" }, ready)).toEqual({ kind: "success", operationId: null })
        expect(resolveAgentOSWorkspaceAiKnowledgeAction({ kind: "recovering", operationId: "recovery-operation" }, ready)).toEqual({ kind: "success", operationId: null })
        expect(resolveAgentOSWorkspaceAiKnowledgeAction({ kind: "recovering", operationId: "new-operation" }, ready)).toEqual({ kind: "recovering", operationId: "new-operation" })
    })
})
