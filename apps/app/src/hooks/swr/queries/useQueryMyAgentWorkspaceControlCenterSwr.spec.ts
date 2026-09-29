import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentWorkspaceControlCenterSwr } from "./useQueryMyAgentWorkspaceControlCenterSwr"
import { QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyAgentWorkspaceControlCenterSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyAgentWorkspaceControlCenterSwr("ws-1", true) as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_AGENT_WORKSPACE_CONTROL_CENTER_SWR_KEY("ws-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
