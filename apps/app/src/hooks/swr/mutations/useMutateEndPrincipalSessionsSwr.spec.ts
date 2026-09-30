import { beforeEach, describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"

const { useAuthMutation, endPrincipalSessions } = vi.hoisted(() => ({
    useAuthMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    endPrincipalSessions: vi.fn(),
}))
vi.mock("../useAuthMutation", () => ({ useAuthMutation }))
vi.mock("@/modules/api/auth", () => ({ endPrincipalSessions }))

import { useMutateEndPrincipalSessionsSwr } from "./useMutateEndPrincipalSessionsSwr"

describe("useMutateEndPrincipalSessionsSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("keeps the administrator session ending on its own session-lifecycle command identity", () => {
        const hook = runAndReadMock(() => useMutateEndPrincipalSessionsSwr(), useAuthMutation)
        expect(hook.key).toEqual(["NIVO_AUTH_MUTATION", "end-principal-sessions"])
    })

    it("hands the request identity, the roster member and the authority context to the transport and returns its answer unchanged", async () => {
        const answer = { ok: true, data: { kind: "undecided", authorityEndingConfirmed: null } }
        endPrincipalSessions.mockResolvedValue(answer)
        const hook = runAndReadMock(() => useMutateEndPrincipalSessionsSwr(), useAuthMutation)
        const trigger = { arg: { requestId: "ending-7", workspaceId: "ws-support", memberId: "linh-member-7" } }
        const settled = await hook.mutation(undefined, trigger)
        expect(endPrincipalSessions).toHaveBeenCalledTimes(1)
        expect(endPrincipalSessions).toHaveBeenCalledWith(trigger.arg)
        expect(settled).toBe(answer)
    })
})
