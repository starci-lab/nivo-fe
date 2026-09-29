import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown) => ({ key, query })),
    api: { resolveWorkspaceCheckoutEntry: vi.fn(async () => ({ ok: true })) },
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery: mocks.useNivoQuery }))
vi.mock("@/modules/api/workspace-controlplane", () => mocks.api)

import { useQueryWorkspaceCheckoutEntrySwr, workspaceCheckoutEntryQueryKey } from "./useQueryWorkspaceCheckoutEntrySwr"

const ENTRY = { purchaseId: "purchase-1", workspaceId: "ws-1" } as const
type ReadShape = { readonly key: unknown; readonly query: () => Promise<unknown> }

describe("useQueryWorkspaceCheckoutEntrySwr", () => {
    it("keys one entry resolution by the purchase and workspace the entry contract compares", () => {
        expect(workspaceCheckoutEntryQueryKey(ENTRY)).toEqual(["workspace-checkout", "entry", "purchase-1", "ws-1"])
        expect(workspaceCheckoutEntryQueryKey(ENTRY)).not.toEqual(
            workspaceCheckoutEntryQueryKey({ ...ENTRY, workspaceId: "ws-2" }),
        )
    })

    it("addresses nothing while readiness is unconfirmed", () => {
        expect((useQueryWorkspaceCheckoutEntrySwr(ENTRY, false) as unknown as ReadShape).key).toBeNull()
    })

    it("resolves the entry destination through the boundary read", async () => {
        const hook = useQueryWorkspaceCheckoutEntrySwr(ENTRY) as unknown as ReadShape

        await hook.query()

        expect(mocks.api.resolveWorkspaceCheckoutEntry).toHaveBeenCalledWith(ENTRY)
    })
})
