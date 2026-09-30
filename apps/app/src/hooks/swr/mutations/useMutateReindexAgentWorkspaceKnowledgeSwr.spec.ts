import type { MutationMockOptions, QueryMockCallback } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options?: MutationMockOptions) => ({
        key,
        mutation,
        options,
    })),
    reindex: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/modules/api/agentos-knowledge", () => ({ reindexAgentWorkspaceKnowledge: mocks.reindex }))

import { useMutateReindexAgentWorkspaceKnowledgeSwr } from "./useMutateReindexAgentWorkspaceKnowledgeSwr"

describe("useMutateReindexAgentWorkspaceKnowledgeSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.reindex.mockResolvedValue({ ok: true, data: { operationId: "reindex-1" } })
    })

    it("binds a reindex command to the exact workspace", async () => {
        const hook = runAndReadMock(
            () => useMutateReindexAgentWorkspaceKnowledgeSwr("workspace-1"),
            mocks.useNivoMutation,
        )
        await hook.mutation("request-2")
        expect(mocks.reindex).toHaveBeenCalledWith({ workspaceId: "workspace-1", idempotencyKey: "request-2" })
    })
})

