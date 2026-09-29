import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { AgentOSFlow } from "@/modules/provisioning/agentos-flow"

const mocks = vi.hoisted(() => ({ readiness: undefined as unknown }))
vi.mock("@/hooks", () => ({
    useQueryMyAgentosAiKnowledgeReadinessSwr: () => ({ data: mocks.readiness, mutate: vi.fn() }),
}))

import { useAgentOSProvisioningPhase } from "./useAgentOSProvisioningPhase"

describe("useAgentOSProvisioningPhase", () => {
    it("derives the five readiness milestones from the workspace snapshot", () => {
        mocks.readiness = {
            ok: true,
            data: {
                provider: "provider",
                chatModel: "model",
                embeddingProfile: "profile",
                embeddingDimension: 1,
                credentialStatus: "configured",
                credentialMaskedHint: null,
                qdrantHealth: "healthy",
                readinessStatus: "ready",
                aiReady: false,
                readinessOperationId: null,
                knowledgeRecoveryOperationId: null,
                components: [],
                origins: [{ origin: "origin", version: null, digest: null, documentCount: 1, lastUpdatedAt: null }],
                failureCode: null,
                testedAt: null,
            },
        }
        const flow: AgentOSFlow = {
            phase: "ready",
            orderId: "order-1",
            workspaceId: "workspace-1",
            subject: "AgentOS",
            detail: "workspace-1",
        }
        const { result } = renderHook(() => useAgentOSProvisioningPhase(flow))
        expect(result.current.steps).toHaveLength(5)
        expect(result.current.steps[4]).toMatchObject({ label: "steps.aiTest", state: "current" })
    })
})
