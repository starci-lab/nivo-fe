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
        startWorkspaceCheckoutPurchase: vi.fn(async () => ({ ok: true })),
        readWorkspaceCheckoutStatus: vi.fn(async () => ({ ok: true })),
    },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api)

import { workspaceCheckoutStatusQueryKey } from "../queries/queries.shared"
import { useMutateWorkspaceCheckoutStartSwr } from "./useMutateWorkspaceCheckoutStartSwr"

const START = { retryKey: "start-purchase-1", offerId: "offer-team", offerVersion: "v1", paymentRail: "vnpay" } as const

describe("useMutateWorkspaceCheckoutStartSwr", () => {
    it("keeps the admission on its own press-local identity", () => {
        expect(runAndReadMock(() => useMutateWorkspaceCheckoutStartSwr(), mocks.useNivoMutation).key).toEqual([
            "workspace-checkout",
            "start",
        ])
    })

    it("admits the purchase through the boundary command with the request unchanged", async () => {
        const hook = runAndReadMock(() => useMutateWorkspaceCheckoutStartSwr(), mocks.useNivoMutation)

        await hook.mutation(START)

        expect(mocks.api.startWorkspaceCheckoutPurchase).toHaveBeenCalledWith(START)
    })

    it("refreshes exactly the purchase an admission answer named, and nothing when it named none", () => {
        const hook = runAndReadMock(() => useMutateWorkspaceCheckoutStartSwr(), mocks.useNivoMutation)

        expect(
            hook.options?.invalidates?.(START, { ok: true, data: { status: "prepared", purchaseId: "purchase-1" } }),
        ).toEqual([workspaceCheckoutStatusQueryKey("purchase-1")])
        expect(
            hook.options?.invalidates?.(START, {
                ok: true,
                data: { status: "outcome-unknown", purchaseId: "purchase-1" },
            }),
        ).toEqual([workspaceCheckoutStatusQueryKey("purchase-1")])
        expect(hook.options?.invalidates?.(START, { ok: true, data: { status: "offers" } })).toEqual([])
        expect(hook.options?.invalidates?.(START, { ok: false })).toEqual([])
    })
})
