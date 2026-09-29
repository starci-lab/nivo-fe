import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery, useAccessToken, api } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    api: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/collab", () => ({ openCollabOffice: api }))

import { openCollabOffice } from "@/modules/api/collab"
import { useQueryCollabOfficeSwr } from "./useQueryCollabOfficeSwr"
import { QUERY_COLLAB_OFFICE_SWR_KEY } from "../swr.shared"

type QueryResult = { readonly key: unknown; readonly query: () => Promise<unknown>; readonly options?: unknown }

describe("useQueryCollabOfficeSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { group: { groupId: "g-1" }, participants: [], viewer: { memberId: "mem-1", role: "staff" } } })
        const result = useQueryCollabOfficeSwr("ws-1") as unknown as QueryResult
        expect(result.key).toEqual(QUERY_COLLAB_OFFICE_SWR_KEY("ws-1"))
        await result.query()
        expect(openCollabOffice).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok" })
    })

    it("mounts no read when the viewer or workspace is missing", () => {
            useAccessToken.mockReturnValueOnce(null)
            expect((useQueryCollabOfficeSwr("ws-1") as unknown as QueryResult).key).toBeNull()
            expect((useQueryCollabOfficeSwr(null) as unknown as QueryResult).key).toBeNull()
        })
})
