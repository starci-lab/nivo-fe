import { beforeEach, describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"

const { useSWRMutation, continueBrokeredSignIn } = vi.hoisted(() => ({
    useSWRMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    continueBrokeredSignIn: vi.fn(),
}))
vi.mock("swr/mutation", () => ({ default: useSWRMutation }))
vi.mock("@/modules/api/auth", () => ({ continueBrokeredSignIn }))

import { useMutateContinueBrokeredSignInSwr } from "./useMutateContinueBrokeredSignInSwr"

describe("useMutateContinueBrokeredSignInSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("keeps the continuation on its own signed-out authentication command identity", () => {
        const hook = runAndReadMock(() => useMutateContinueBrokeredSignInSwr(), useSWRMutation)
        expect(hook.key).toEqual(["NIVO_AUTH_MUTATION", "continue-brokered-sign-in"])
    })

    it("spends the returned continuation reference through the transport and returns its answer unchanged", async () => {
        const answer = { ok: true, data: { kind: "accepted" } }
        continueBrokeredSignIn.mockResolvedValue(answer)
        const hook = runAndReadMock(() => useMutateContinueBrokeredSignInSwr(), useSWRMutation)
        const trigger = { arg: { continuationReference: "hold-7" } }
        const settled = await hook.mutation(undefined, trigger)
        expect(continueBrokeredSignIn).toHaveBeenCalledTimes(1)
        expect(continueBrokeredSignIn).toHaveBeenCalledWith(trigger.arg)
        expect(settled).toBe(answer)
    })
})
