import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    api: { readWorkspaceCheckoutStatus: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api)

import { useQueryWorkspaceCheckoutStatusSwr } from "./useQueryWorkspaceCheckoutStatusSwr"
import { workspaceCheckoutStatusQueryKey } from "./queries.shared"

describe("useQueryWorkspaceCheckoutStatusSwr", () => {
    it("keys one purchase status read by the purchase identity alone", () => {
        expect(workspaceCheckoutStatusQueryKey("purchase-1")).toEqual(["workspace-checkout", "status", "purchase-1"])
        expect(workspaceCheckoutStatusQueryKey("purchase-1")).not.toEqual(workspaceCheckoutStatusQueryKey("purchase-2"))
    })

    it("addresses nothing until a purchase identity is known", () => {
        expect(
            runAndReadMock(() => useQueryWorkspaceCheckoutStatusSwr("purchase-1", false), mocks.useNivoQuery).key,
        ).toBeNull()
    })

    it("reads one purchase's composed truth through the boundary read", async () => {
        const hook = runAndReadMock(() => useQueryWorkspaceCheckoutStatusSwr("purchase-1"), mocks.useNivoQuery)

        await hook.query()

        expect(mocks.api.readWorkspaceCheckoutStatus).toHaveBeenCalledWith("purchase-1")
    })
})
