import { apiAnswer, runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    useAccessToken: vi.fn((): string | null => "tok"),
    mutate: vi.fn(async () => undefined),
    withdraw: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken: mocks.useAccessToken }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.mutate }) }))
vi.mock("@/modules/api/collab", () => ({ withdrawCollabInvitation: mocks.withdraw }))

import { withdrawCollabInvitation } from "@/modules/api/collab"
import { useMutateCollabWithdrawInvitationSwr } from "./useMutateCollabWithdrawInvitationSwr"

describe("useMutateCollabWithdrawInvitationSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("closes one pending invitation under its workspace identity", async () => {
        mocks.withdraw.mockResolvedValue(apiAnswer(withdrawCollabInvitation, { ok: true, data: { outcome: "withdrawn" } }))
        const hook = runAndReadMock(() => useMutateCollabWithdrawInvitationSwr("ws-1"), mocks.useNivoMutation)
        await hook.mutation({ invitationId: "inv-1" })
        expect(withdrawCollabInvitation).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            invitationId: "inv-1",
        })
    })
})

