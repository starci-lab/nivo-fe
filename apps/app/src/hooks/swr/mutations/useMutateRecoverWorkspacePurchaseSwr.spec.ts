import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback, MutationMockOptions } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback, options: MutationMockOptions | undefined) => ({
        key,
        mutation,
        options,
    })),
    api: {
        recoverWorkspacePurchase: vi.fn(async () => ({ ok: true })),
        readWorkspaceCheckoutStatus: vi.fn(async () => ({ ok: true })),
    },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api)

import { workspaceCheckoutStatusQueryKey } from "../queries/queries.shared"
import { useMutateRecoverWorkspacePurchaseSwr } from "./useMutateRecoverWorkspacePurchaseSwr"

const RECOVER = {
    purchaseId: "purchase-1",
    lastObserved: { paymentAttemptId: "attempt-1", providerReference: "vnpay-tx-1" },
} as const

describe("useMutateRecoverWorkspacePurchaseSwr", () => {
    it("keeps the recovery on its own press-local identity", () => {
        expect(runAndReadMock(() => useMutateRecoverWorkspacePurchaseSwr(), mocks.useNivoMutation).key).toEqual([
            "workspace-checkout",
            "recover",
        ])
    })

    it("reconciles through the boundary command with the observed identities unchanged", async () => {
        const hook = runAndReadMock(() => useMutateRecoverWorkspacePurchaseSwr(), mocks.useNivoMutation)

        await hook.mutation(RECOVER)

        expect(mocks.api.recoverWorkspacePurchase).toHaveBeenCalledWith(RECOVER)
    })

    it("refreshes the purchase the recovery named, whatever the answer says", () => {
        const hook = runAndReadMock(() => useMutateRecoverWorkspacePurchaseSwr(), mocks.useNivoMutation)

        expect(hook.options?.invalidates?.(RECOVER, { ok: true })).toEqual([
            workspaceCheckoutStatusQueryKey("purchase-1"),
        ])
        expect(hook.options?.invalidates?.(RECOVER, { ok: false })).toEqual([
            workspaceCheckoutStatusQueryKey("purchase-1"),
        ])
    })
})
