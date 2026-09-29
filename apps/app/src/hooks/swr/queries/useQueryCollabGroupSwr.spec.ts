import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery, useAccessToken, api } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    api: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/collab", () => ({ readCollabGroup: api }))

import { readCollabGroup } from "@/modules/api/collab"
import { useQueryCollabGroupSwr } from "./useQueryCollabGroupSwr"
import { QUERY_COLLAB_GROUP_SWR_KEY } from "../swr.shared"

type QueryResult = { readonly key: unknown; readonly query: () => Promise<unknown>; readonly options?: unknown }

describe("useQueryCollabGroupSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { messages: [] } })
        const result = useQueryCollabGroupSwr("ws-1", "c-1") as unknown as QueryResult
        expect(result.key).toEqual(QUERY_COLLAB_GROUP_SWR_KEY("ws-1", "c-1"))
        await result.query()
        expect(readCollabGroup).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", cursor: "c-1" })
    })

    it("keeps the socket fallback interval supplied by the caller", () => {
            expect(((useQueryCollabGroupSwr("ws-1") as unknown as QueryResult).options as { refreshInterval: number }).refreshInterval).toBe(0)
            expect(((useQueryCollabGroupSwr("ws-1", undefined, 5_000) as unknown as QueryResult).options as { refreshInterval: number }).refreshInterval).toBe(5_000)
        })
})
