import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentWorkspaceControlCenterSwr } from "./useQueryMyAgentWorkspaceControlCenterSwr"
import { QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY } from "../swr.shared"


describe("useQueryMyAgentWorkspaceControlCenterSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = runAndReadMock(() => useQueryMyAgentWorkspaceControlCenterSwr("ws-1", true), useNivoQuery)
        expect(result.key).toEqual(QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY("ws-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
