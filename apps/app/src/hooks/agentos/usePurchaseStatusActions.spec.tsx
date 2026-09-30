import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { createTranslator } from "next-intl"
import enMessages from "@/messages/en.json"
import { createPurchaseStatusCopy } from "@/modules/agentos/purchase-status/copy"

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    trigger: vi.fn(),
    mutate: vi.fn(async () => undefined),
}))

vi.mock("@/hooks", () => ({
    useRouter: () => ({ push: mocks.push }),
    useMutateRecoverWorkspacePurchaseSwr: () => ({ trigger: mocks.trigger, isMutating: false }),
    useQueryWorkspaceCheckoutEntrySwr: () => ({ data: undefined, isValidating: false, mutate: mocks.mutate }),
}))

import { usePurchaseStatusActions } from "./usePurchaseStatusActions"

const copy = createPurchaseStatusCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.purchaseStatus",
        onError: (error) => {
            throw error
        },
    }),
    enMessages.console.provisioningFlows.connecting,
)

describe("usePurchaseStatusActions", () => {
    it("returns from the purchase surface through the app router", () => {
        const { result } = renderHook(() =>
            usePurchaseStatusActions({
                purchaseId: "purchase-1",
                statusAnswer: undefined,
                statusPurchase: null,
                copy,
                refreshStatus: mocks.mutate,
            }),
        )

        act(() => result.current.actions.returnToList())

        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces")
    })

    it("does not request entry until a ready workspace identity is present", () => {
        const { result } = renderHook(() =>
            usePurchaseStatusActions({
                purchaseId: "purchase-1",
                statusAnswer: undefined,
                statusPurchase: null,
                copy,
                refreshStatus: mocks.mutate,
            }),
        )

        act(() => result.current.actions.enterWorkspace())

        expect(result.current.entryPending).toBe(false)
        expect(mocks.mutate).not.toHaveBeenCalled()
    })
})
