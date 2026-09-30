import { apiAnswer, runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    useAccessToken: vi.fn((): string | null => "tok"),
    mutate: vi.fn(async () => undefined),
    changeRole: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken: mocks.useAccessToken }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.mutate }) }))
vi.mock("@/modules/api/collab", () => ({ changeCollabMemberRole: mocks.changeRole }))

import { changeCollabMemberRole } from "@/modules/api/collab"
import { useMutateCollabChangeMemberRoleSwr } from "./useMutateCollabChangeMemberRoleSwr"

describe("useMutateCollabChangeMemberRoleSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("replaces one member's role under the workspace identity", async () => {
        mocks.changeRole.mockResolvedValue(
            apiAnswer(changeCollabMemberRole, { ok: true, data: { outcome: "roleChanged" } }),
        )
        const hook = runAndReadMock(() => useMutateCollabChangeMemberRoleSwr("ws-1"), mocks.useNivoMutation)
        await hook.mutation({ memberId: "member-1", role: "manager" })
        expect(changeCollabMemberRole).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            memberId: "member-1",
            role: "manager",
        })
    })
})

