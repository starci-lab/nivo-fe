import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    api: { readWorkspaceCheckoutOffers: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api)

import {
    useQueryWorkspaceCheckoutOffersSwr,
    workspaceCheckoutOffersQueryKey,
} from "./useQueryWorkspaceCheckoutOffersSwr"

describe("useQueryWorkspaceCheckoutOffersSwr", () => {
    it("keys one offer selection by the exact offer identity and version presented", () => {
        expect(workspaceCheckoutOffersQueryKey("offer-team", "v1")).toEqual([
            "workspace-checkout",
            "offers",
            "offer-team",
            "v1",
        ])
        expect(workspaceCheckoutOffersQueryKey("offer-team", "v1")).not.toEqual(
            workspaceCheckoutOffersQueryKey("offer-team", "v2"),
        )
    })

    it("addresses nothing while the screen holds no offer to present", () => {
        expect(
            runAndReadMock(() => useQueryWorkspaceCheckoutOffersSwr("offer-team", "v1", false), mocks.useNivoQuery).key,
        ).toBeNull()
    })

    it("selects the exact offer version through the boundary read", async () => {
        const hook = runAndReadMock(() => useQueryWorkspaceCheckoutOffersSwr("offer-team", "v1"), mocks.useNivoQuery)

        await hook.query()

        expect(mocks.api.readWorkspaceCheckoutOffers).toHaveBeenCalledWith("offer-team", "v1")
    })
})
