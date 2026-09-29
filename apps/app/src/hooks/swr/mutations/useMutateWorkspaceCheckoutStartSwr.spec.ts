import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: unknown, options: unknown) => ({ key, mutation, options })),
    api: {
        startWorkspaceCheckoutPurchase: vi.fn(async () => ({ ok: true })),
        readWorkspaceCheckoutStatus: vi.fn(async () => ({ ok: true })),
    },
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api)

import { workspaceCheckoutStatusQueryKey } from "../queries/useQueryWorkspaceCheckoutStatusSwr"
import { useMutateWorkspaceCheckoutStartSwr } from "./useMutateWorkspaceCheckoutStartSwr"

const START = { retryKey: "start-purchase-1", offerId: "offer-team", offerVersion: "v1", paymentRail: "vnpay" } as const
type CheckoutAnswer = {
    readonly ok: boolean
    readonly data?: { readonly status: string; readonly purchaseId?: string | null }
}
type StartShape = {
    readonly key: unknown
    readonly mutation: (request: typeof START) => Promise<unknown>
    readonly options: {
        readonly invalidates: (request: typeof START, answer: CheckoutAnswer) => ReadonlyArray<unknown>
    }
}

describe("useMutateWorkspaceCheckoutStartSwr", () => {
    it("keeps the admission on its own press-local identity", () => {
        expect((useMutateWorkspaceCheckoutStartSwr() as unknown as StartShape).key).toEqual([
            "workspace-checkout",
            "start",
        ])
    })

    it("admits the purchase through the boundary command with the request unchanged", async () => {
        const hook = useMutateWorkspaceCheckoutStartSwr() as unknown as StartShape

        await hook.mutation(START)

        expect(mocks.api.startWorkspaceCheckoutPurchase).toHaveBeenCalledWith(START)
    })

    it("refreshes exactly the purchase an admission answer named, and nothing when it named none", () => {
        const hook = useMutateWorkspaceCheckoutStartSwr() as unknown as StartShape

        expect(
            hook.options.invalidates(START, { ok: true, data: { status: "prepared", purchaseId: "purchase-1" } }),
        ).toEqual([workspaceCheckoutStatusQueryKey("purchase-1")])
        expect(
            hook.options.invalidates(START, {
                ok: true,
                data: { status: "outcome-unknown", purchaseId: "purchase-1" },
            }),
        ).toEqual([workspaceCheckoutStatusQueryKey("purchase-1")])
        expect(hook.options.invalidates(START, { ok: true, data: { status: "offers" } })).toEqual([])
        expect(hook.options.invalidates(START, { ok: false })).toEqual([])
    })
})
