import type { MutationMockOptions, QueryMockCallback } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options?: MutationMockOptions) => ({
        key,
        mutation,
        options,
    })),
    startIntake: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/modules/api/agentos-module-studio", () => ({
    startAgentosCustomModuleIntake: mocks.startIntake,
}))

import { useMutateStartAgentosCustomModuleIntakeSwr } from "./useMutateStartAgentosCustomModuleIntakeSwr"

describe("useMutateStartAgentosCustomModuleIntakeSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.startIntake.mockResolvedValue({ ok: true, data: { module: { id: "module-1" } } })
    })

    it("binds the intake command to its workspace", async () => {
        const hook = runAndReadMock(
            () => useMutateStartAgentosCustomModuleIntakeSwr("workspace-1"),
            mocks.useNivoMutation,
        )
        await hook.mutation({ goal: "Build a support bot", idempotencyKey: "request-1" })
        expect(mocks.startIntake).toHaveBeenCalledWith({
            agentWorkspaceId: "workspace-1",
            goal: "Build a support bot",
            idempotencyKey: "request-1",
        })
    })
})

