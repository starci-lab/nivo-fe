import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery, useAccessToken, api } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    api: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/collab", () => ({ openCollabNotice: api }))

import { openCollabNotice } from "@/modules/api/collab"
import { useQueryCollabNoticeSwr } from "./useQueryCollabNoticeSwr"
import { QUERY_COLLAB_NOTICE_SWR_KEY } from "../swr.shared"

type QueryResult = { readonly key: unknown; readonly query: () => Promise<unknown>; readonly options?: unknown }

describe("useQueryCollabNoticeSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { outcome: "found" } })
        const result = useQueryCollabNoticeSwr("ws-1", "n-1") as unknown as QueryResult
        expect(result.key).toEqual(QUERY_COLLAB_NOTICE_SWR_KEY("ws-1", "n-1"))
        await result.query()
        expect(openCollabNotice).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", noticeId: "n-1" })
    })

    it("mounts no read without a notice identity", () => {
            expect((useQueryCollabNoticeSwr("ws-1", null) as unknown as QueryResult).key).toBeNull()
        })
})
