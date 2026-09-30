import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery, useAccessToken, api } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    api: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/collab", () => ({ readCollabGroup: api }))

import { readCollabGroup } from "@/modules/api/collab"
import { useQueryCollabGroupSwr } from "./useQueryCollabGroupSwr"
import { QUERY_COLLAB_GROUP_SWR_KEY } from "../swr.shared"


describe("useQueryCollabGroupSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { messages: [] } })
        const result = runAndReadMock(() => useQueryCollabGroupSwr("ws-1", "c-1"), useNivoQuery)
        expect(result.key).toEqual(QUERY_COLLAB_GROUP_SWR_KEY("ws-1", "c-1"))
        await result.query()
        expect(readCollabGroup).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", cursor: "c-1" })
    })

    it("keeps the socket fallback interval supplied by the caller", () => {
            expect(runAndReadMock(() => useQueryCollabGroupSwr("ws-1"), useNivoQuery).options?.refreshInterval).toBe(0)
            expect(runAndReadMock(() => useQueryCollabGroupSwr("ws-1", undefined, 5_000), useNivoQuery).options?.refreshInterval).toBe(5_000)
        })
})
