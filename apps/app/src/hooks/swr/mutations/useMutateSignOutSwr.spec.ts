import { beforeEach, describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"

const { useAuthMutation, signOut } = vi.hoisted(() => ({
    useAuthMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    signOut: vi.fn(),
}))
vi.mock("../useAuthMutation", () => ({ useAuthMutation }))
vi.mock("@/modules/api/auth", () => ({ signOut }))

import { useMutateSignOutSwr } from "./useMutateSignOutSwr"

describe("useMutateSignOutSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("keeps sign-out on its own signed-out authentication command identity", () => {
        const hook = runAndReadMock(() => useMutateSignOutSwr(), useAuthMutation)
        expect(hook.key).toEqual(["NIVO_AUTH_MUTATION", "sign-out"])
    })

    it("returns the whole sign-out envelope, siblings included, instead of unwrapping its payload", async () => {
        const envelope = { ok: true, data: true, remoteRevocationObserved: false, authorityEndingConfirmed: true }
        signOut.mockResolvedValue(envelope)
        const hook = runAndReadMock(() => useMutateSignOutSwr(), useAuthMutation)
        const trigger = { arg: { scope: "everywhere" } }
        const settled = await hook.mutation(undefined, trigger)
        expect(signOut).toHaveBeenCalledWith(trigger.arg)
        expect(settled).toBe(envelope)
        expect(settled).toMatchObject({ remoteRevocationObserved: false, authorityEndingConfirmed: true })
    })
})
