import { apiAnswer, runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    useAccessToken: vi.fn((): string | null => "tok"),
    mutate: vi.fn(async () => undefined),
    invite: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken: mocks.useAccessToken }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.mutate }) }))
vi.mock("@/modules/api/collab", () => ({ inviteCollabMemberByEmail: mocks.invite }))

import { inviteCollabMemberByEmail } from "@/modules/api/collab"
import { useMutateCollabInviteByEmailSwr } from "./useMutateCollabInviteByEmailSwr"

describe("useMutateCollabInviteByEmailSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("invites one person by email into one workspace role", async () => {
        mocks.invite.mockResolvedValue(apiAnswer(inviteCollabMemberByEmail, { ok: true, data: { outcome: "created" } }))
        const hook = runAndReadMock(() => useMutateCollabInviteByEmailSwr("ws-1"), mocks.useNivoMutation)
        await hook.mutation({ email: "person@example.com", role: "staff" })
        expect(inviteCollabMemberByEmail).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            email: "person@example.com",
            role: "staff",
        })
    })
})

