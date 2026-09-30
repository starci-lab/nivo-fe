import { beforeEach, describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"

const { useSWRMutation } = vi.hoisted(() => ({
    useSWRMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
}))
vi.mock("swr/mutation", () => ({ default: useSWRMutation }))

import { useAuthMutation } from "./useAuthMutation"

describe("useAuthMutation", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses the signed-out authentication namespace and returns the transport answer", async () => {
        const answer = { ok: true as const }
        const mutation = vi.fn().mockResolvedValue(answer)
        const hook = runAndReadMock(() => useAuthMutation("sign-in", mutation), useSWRMutation)

        expect(hook.key).toEqual(["NIVO_AUTH_MUTATION", "sign-in"])
        await expect(hook.mutation(undefined, { arg: { value: "input" } })).resolves.toBe(answer)
        expect(mutation).toHaveBeenCalledWith({ value: "input" })
    })
})
