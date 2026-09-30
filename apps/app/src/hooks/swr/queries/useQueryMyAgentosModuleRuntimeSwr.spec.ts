import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosModuleRuntimeSwr } from "./useQueryMyAgentosModuleRuntimeSwr"
import { QUERY_AGENTOS_MODULE_RUNTIME_SWR_KEY } from "../swr.shared"


describe("useQueryMyAgentosModuleRuntimeSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = runAndReadMock(() => useQueryMyAgentosModuleRuntimeSwr("ws-1", "installation-1", true), useNivoQuery)
        expect(result.key).toEqual(QUERY_AGENTOS_MODULE_RUNTIME_SWR_KEY("ws-1", "installation-1", true))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
