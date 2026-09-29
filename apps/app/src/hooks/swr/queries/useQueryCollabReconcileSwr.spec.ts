import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery, useAccessToken, api } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    api: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/collab", () => ({ reconcileCollabRequest: api }))

import { reconcileCollabRequest } from "@/modules/api/collab"
import { useQueryCollabReconcileSwr } from "./useQueryCollabReconcileSwr"
import { QUERY_COLLAB_RECONCILE_SWR_KEY } from "../swr.shared"

type QueryResult = { readonly key: unknown; readonly query: () => Promise<unknown>; readonly options?: unknown }

describe("useQueryCollabReconcileSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { outcome: "none" } })
        const result = useQueryCollabReconcileSwr("ws-1", "i-1") as unknown as QueryResult
        expect(result.key).toEqual(QUERY_COLLAB_RECONCILE_SWR_KEY("ws-1", "i-1"))
        await result.query()
        expect(reconcileCollabRequest).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", intentId: "i-1" })
    })

    it("mounts no read without an intent identity", () => {
            expect((useQueryCollabReconcileSwr("ws-1", null) as unknown as QueryResult).key).toBeNull()
        })
})
