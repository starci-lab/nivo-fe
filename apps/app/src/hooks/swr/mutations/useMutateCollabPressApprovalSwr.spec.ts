import { apiAnswer, collabRouteFixture, runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    useAccessToken: vi.fn((): string | null => "tok"),
    mutate: vi.fn(async () => undefined),
    pressApproval: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken: mocks.useAccessToken }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.mutate }) }))
vi.mock("@/modules/api/collab", () => ({ pressCollabApprovalButton: mocks.pressApproval }))

import { pressCollabApprovalButton } from "@/modules/api/collab"
import { useMutateCollabPressApprovalSwr } from "./useMutateCollabPressApprovalSwr"

describe("useMutateCollabPressApprovalSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("keeps the approval key workspace-scoped", () => {
        expect(runAndReadMock(() => useMutateCollabPressApprovalSwr("ws-1"), mocks.useNivoMutation).key).toEqual([
            "collab",
            "press",
            "ws-1",
        ])
    })

    it("does not invalidate reads when the boundary refuses the press", async () => {
        mocks.pressApproval.mockResolvedValue(
            apiAnswer(pressCollabApprovalButton, {
                ok: false,
                code: "COLLAB_DENIED",
                reason: "membership",
                kind: "forbidden",
                status: 403,
                retryable: false,
            }),
        )
        const hook = runAndReadMock(() => useMutateCollabPressApprovalSwr("ws-1"), mocks.useNivoMutation)
        const answer = await hook.mutation({ approvalId: "a-1", button: "approve" })
        expect(pressCollabApprovalButton).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            approvalId: "a-1",
            button: "approve",
        })
        expect(answer).toMatchObject({ ok: false, kind: "forbidden", retryable: false })
        expect(mocks.mutate).not.toHaveBeenCalled()
    })
})

