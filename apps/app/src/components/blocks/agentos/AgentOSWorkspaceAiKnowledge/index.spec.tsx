import { describe, expect, it } from "vitest"
import type { AgentosAiKnowledgeReadiness } from "@/modules/api/agentos-knowledge"
import {
    resolveAgentOSWorkspaceAiKnowledgeAction,
    resolveAgentOSWorkspaceAiKnowledgeState,
    type AgentOSWorkspaceAiKnowledgeAction,
} from "."

/** A settled readiness answer the cases vary only where they must. */
const readiness = (overrides: Partial<AgentosAiKnowledgeReadiness>): AgentosAiKnowledgeReadiness => ({
    provider: "OpenRouter",
    chatModel: "deepseek/deepseek-chat",
    embeddingProfile: "nivo-embedding-v1",
    embeddingDimension: 1024,
    credentialStatus: "configured",
    credentialMaskedHint: "or-…7a",
    qdrantHealth: "healthy",
    readinessStatus: "ready",
    aiReady: true,
    readinessOperationId: null,
    knowledgeRecoveryOperationId: null,
    components: [],
    origins: [],
    failureCode: null,
    testedAt: "2026-08-23T00:00:00.000Z",
    ...overrides,
})

describe("resolveAgentOSWorkspaceAiKnowledgeAction", () => {
    it("completes the page's test once its operation stops testing and the AI is ready", () => {
        const action: AgentOSWorkspaceAiKnowledgeAction = { kind: "testing", operationId: "op-1" }
        const answer = readiness({ readinessOperationId: "op-1", readinessStatus: "ready", aiReady: true })

        expect(resolveAgentOSWorkspaceAiKnowledgeAction(action, answer)).toEqual({
            kind: "success",
            operationId: null,
        })
    })

    it("clears the page's test when it settles without making the AI ready", () => {
        const action: AgentOSWorkspaceAiKnowledgeAction = { kind: "testing", operationId: "op-1" }
        const answer = readiness({ readinessOperationId: "op-1", readinessStatus: "refused", aiReady: false })

        expect(resolveAgentOSWorkspaceAiKnowledgeAction(action, answer)).toBeNull()
    })

    it("keeps the page's test pending while its own operation is still testing", () => {
        const action: AgentOSWorkspaceAiKnowledgeAction = { kind: "testing", operationId: "op-1" }
        const answer = readiness({ readinessOperationId: "op-1", readinessStatus: "testing", aiReady: false })

        expect(resolveAgentOSWorkspaceAiKnowledgeAction(action, answer)).toBe(action)
    })

    it("does not complete the page's test on a different operation's receipt", () => {
        const action: AgentOSWorkspaceAiKnowledgeAction = { kind: "testing", operationId: "op-1" }
        const answer = readiness({ readinessOperationId: "op-2", readinessStatus: "ready", aiReady: true })

        expect(resolveAgentOSWorkspaceAiKnowledgeAction(action, answer)).toBe(action)
    })

    it("latches a completed action and leaves no action alone", () => {
        const success: AgentOSWorkspaceAiKnowledgeAction = { kind: "success", operationId: null }
        const answer = readiness({ readinessOperationId: "op-2", readinessStatus: "testing" })

        expect(resolveAgentOSWorkspaceAiKnowledgeAction(success, answer)).toBe(success)
        expect(resolveAgentOSWorkspaceAiKnowledgeAction(null, answer)).toBeNull()
    })

    it("completes the page's recovery when its operation receipt arrives", () => {
        const action: AgentOSWorkspaceAiKnowledgeAction = { kind: "recovering", operationId: "op-9" }
        const answer = readiness({ knowledgeRecoveryOperationId: "op-9" })

        expect(resolveAgentOSWorkspaceAiKnowledgeAction(action, answer)).toEqual({
            kind: "success",
            operationId: null,
        })
    })
})

describe("resolveAgentOSWorkspaceAiKnowledgeState", () => {
    it("reads the locally started action ahead of the server lifecycle", () => {
        const answer = readiness({})
        expect(
            resolveAgentOSWorkspaceAiKnowledgeState(answer, { kind: "recovering", operationId: "op-1" }, false),
        ).toBe("recovering")
        expect(resolveAgentOSWorkspaceAiKnowledgeState(answer, { kind: "success", operationId: null }, false)).toBe(
            "success",
        )
    })

    it("is refused when the answer is refused or the action was refused", () => {
        expect(resolveAgentOSWorkspaceAiKnowledgeState(null, null, false)).toBe("refused")
        expect(resolveAgentOSWorkspaceAiKnowledgeState(readiness({}), null, true)).toBe("refused")
    })

    it("loads, configures, then settles from the server lifecycle when nothing is pending", () => {
        expect(resolveAgentOSWorkspaceAiKnowledgeState(undefined, null, false)).toBe("loading")
        expect(resolveAgentOSWorkspaceAiKnowledgeState(readiness({ credentialStatus: "missing" }), null, false)).toBe(
            "key-configuring",
        )
        expect(resolveAgentOSWorkspaceAiKnowledgeState(readiness({ aiReady: false }), null, false)).toBe("refused")
        expect(resolveAgentOSWorkspaceAiKnowledgeState(readiness({}), null, false)).toBe("ready")
    })
})
