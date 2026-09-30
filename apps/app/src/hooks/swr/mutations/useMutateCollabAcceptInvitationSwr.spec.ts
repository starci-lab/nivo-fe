import { apiAnswer, runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    useAccessToken: vi.fn((): string | null => "tok"),
    mutate: vi.fn(async () => undefined),
    accept: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken: mocks.useAccessToken }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.mutate }) }))
vi.mock("@/modules/api/collab", () => ({ acceptCollabInvitation: mocks.accept }))

import { acceptCollabInvitation } from "@/modules/api/collab"
import { useMutateCollabAcceptInvitationSwr } from "./useMutateCollabAcceptInvitationSwr"

describe("useMutateCollabAcceptInvitationSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("consumes one invitation with the invited person's session", async () => {
        mocks.accept.mockResolvedValue(apiAnswer(acceptCollabInvitation, { ok: true, data: { outcome: "accepted" } }))
        const hook = runAndReadMock(() => useMutateCollabAcceptInvitationSwr("ws-1"), mocks.useNivoMutation)
        await hook.mutation({ invitationId: "inv-1", displayName: "An" })
        expect(acceptCollabInvitation).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            invitationId: "inv-1",
            displayName: "An",
        })
    })
})

