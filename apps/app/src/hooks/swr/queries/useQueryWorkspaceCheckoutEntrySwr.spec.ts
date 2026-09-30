import { describe, expect, it, vi } from "vitest"
import { runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: QueryMockCallback) => ({ key, query })),
    api: { resolveWorkspaceCheckoutEntry: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api)

import { useQueryWorkspaceCheckoutEntrySwr } from "./useQueryWorkspaceCheckoutEntrySwr"
import { workspaceCheckoutEntryQueryKey } from "./queries.shared"

const ENTRY = { purchaseId: "purchase-1", workspaceId: "ws-1" } as const

describe("useQueryWorkspaceCheckoutEntrySwr", () => {
    it("keys one entry resolution by the purchase and workspace the entry contract compares", () => {
        expect(workspaceCheckoutEntryQueryKey(ENTRY)).toEqual(["workspace-checkout", "entry", "purchase-1", "ws-1"])
        expect(workspaceCheckoutEntryQueryKey(ENTRY)).not.toEqual(
            workspaceCheckoutEntryQueryKey({ ...ENTRY, workspaceId: "ws-2" }),
        )
    })

    it("addresses nothing while readiness is unconfirmed", () => {
        expect(runAndReadMock(() => useQueryWorkspaceCheckoutEntrySwr(ENTRY, false), mocks.useNivoQuery).key).toBeNull()
    })

    it("resolves the entry destination through the boundary read", async () => {
        const hook = runAndReadMock(() => useQueryWorkspaceCheckoutEntrySwr(ENTRY), mocks.useNivoQuery)

        await hook.query()

        expect(mocks.api.resolveWorkspaceCheckoutEntry).toHaveBeenCalledWith(ENTRY)
    })
})
