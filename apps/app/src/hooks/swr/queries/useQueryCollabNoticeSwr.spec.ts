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
vi.mock("@/modules/api/collab", () => ({ openCollabNotice: api }))

import { openCollabNotice } from "@/modules/api/collab"
import { useQueryCollabNoticeSwr } from "./useQueryCollabNoticeSwr"
import { QUERY_COLLAB_NOTICE_SWR_KEY } from "../swr.shared"


describe("useQueryCollabNoticeSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { outcome: "found" } })
        const result = runAndReadMock(() => useQueryCollabNoticeSwr("ws-1", "n-1"), useNivoQuery)
        expect(result.key).toEqual(QUERY_COLLAB_NOTICE_SWR_KEY("ws-1", "n-1"))
        await result.query()
        expect(openCollabNotice).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", noticeId: "n-1" })
    })

    it("mounts no read without a notice identity", () => {
            expect((runAndReadMock(() => useQueryCollabNoticeSwr("ws-1", null), useNivoQuery)).key).toBeNull()
        })
})
