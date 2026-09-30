import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery, useAccessToken, api } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
    useAccessToken: vi.fn((): string | null => "tok"),
    api: vi.fn(),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken }))
vi.mock("@/modules/api/collab", () => ({ readCollabTask: api }))

import { readCollabTask } from "@/modules/api/collab"
import { useQueryCollabTaskSwr } from "./useQueryCollabTaskSwr"
import { QUERY_COLLAB_TASK_SWR_KEY } from "../swr.shared"


describe("useQueryCollabTaskSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        api.mockResolvedValue({ ok: true, data: { outcome: "found" } })
        const result = runAndReadMock(() => useQueryCollabTaskSwr("ws-1", "t-1"), useNivoQuery)
        expect(result.key).toEqual(QUERY_COLLAB_TASK_SWR_KEY("ws-1", "t-1"))
        await result.query()
        expect(readCollabTask).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", taskId: "t-1" })
    })

    it("mounts no read without a task identity", () => {
            expect((runAndReadMock(() => useQueryCollabTaskSwr("ws-1", null), useNivoQuery)).key).toBeNull()
        })
})
