import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery, useAccessToken, api } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    api: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/collab", () => ({ reconcileCollabRequest: api }))

import { reconcileCollabRequest } from "@/modules/api/collab"
import { useQueryCollabReconcileSwr } from "./useQueryCollabReconcileSwr"
import { QUERY_COLLAB_RECONCILE_SWR_KEY } from "../swr.shared"


describe("useQueryCollabReconcileSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { outcome: "none" } })
        const result = runAndReadMock(() => useQueryCollabReconcileSwr("ws-1", "i-1"), useNivoQuery)
        expect(result.key).toEqual(QUERY_COLLAB_RECONCILE_SWR_KEY("ws-1", "i-1"))
        await result.query()
        expect(reconcileCollabRequest).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", intentId: "i-1" })
    })

    it("mounts no read without an intent identity", () => {
            expect((runAndReadMock(() => useQueryCollabReconcileSwr("ws-1", null), useNivoQuery)).key).toBeNull()
        })
})
