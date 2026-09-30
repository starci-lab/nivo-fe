import type { MutationMockOptions, QueryMockCallback } from "@/test-support/mock-result"
import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options?: MutationMockOptions) => ({
        key,
        mutation,
        options,
    })),
    readiness: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/modules/api/agentos-knowledge", () => ({ runAgentosAiReadinessTest: mocks.readiness }))

import { useMutateRunAgentosAiReadinessTestSwr } from "./useMutateRunAgentosAiReadinessTestSwr"

describe("useMutateRunAgentosAiReadinessTestSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.readiness.mockResolvedValue({ ok: true, data: { operationId: "readiness-1" } })
    })

    it("binds a readiness command to the exact workspace", async () => {
        const hook = runAndReadMock(
            () => useMutateRunAgentosAiReadinessTestSwr("workspace-1"),
            mocks.useNivoMutation,
        )
        await hook.mutation("request-1")
        expect(mocks.readiness).toHaveBeenCalledWith({ workspaceId: "workspace-1", idempotencyKey: "request-1" })
    })
})

