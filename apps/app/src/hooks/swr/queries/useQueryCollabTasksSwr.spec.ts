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
vi.mock("@/modules/api/collab", () => ({ listCollabTasks: api }))

import { listCollabTasks } from "@/modules/api/collab"
import { useQueryCollabTasksSwr } from "./useQueryCollabTasksSwr"
import { QUERY_COLLAB_TASKS_SWR_KEY } from "../swr.shared"


describe("useQueryCollabTasksSwr", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useAccessToken.mockReturnValue("tok")
    })

    it("uses its shared key and reads the exact workspace-scoped resource", async () => {
        const filters = { personMemberId: "m-1", status: "working" as const }
        api.mockResolvedValue({ ok: true, data: { tasks: [] } })
        const result = runAndReadMock(() => useQueryCollabTasksSwr("ws-1", filters), useNivoQuery)
        expect(result.key).toEqual(QUERY_COLLAB_TASKS_SWR_KEY("ws-1", filters))
        await result.query()
        expect(listCollabTasks).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", personMemberId: "m-1", status: "working" })
    })

    it("keeps Tasks filter variants in separate cache identities", () => {
            const unfiltered = QUERY_COLLAB_TASKS_SWR_KEY("ws-1")
            expect(QUERY_COLLAB_TASKS_SWR_KEY("ws-1", { personMemberId: "m-1" })).not.toEqual(unfiltered)
            expect(QUERY_COLLAB_TASKS_SWR_KEY("ws-1", { status: "working" })).not.toEqual(unfiltered)
            expect(QUERY_COLLAB_TASKS_SWR_KEY("ws-1", { cursor: "c-2" })).not.toEqual(unfiltered)
        })
})
