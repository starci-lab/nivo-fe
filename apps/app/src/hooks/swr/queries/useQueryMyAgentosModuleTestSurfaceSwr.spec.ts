import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosModuleTestSurfaceSwr } from "./useQueryMyAgentosModuleTestSurfaceSwr"
import { QUERY_AGENTOS_MODULE_TEST_SURFACE_SWR_KEY } from "../swr.shared"


describe("useQueryMyAgentosModuleTestSurfaceSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = runAndReadMock(() => useQueryMyAgentosModuleTestSurfaceSwr("installation-1", true), useNivoQuery)
        expect(result.key).toEqual(QUERY_AGENTOS_MODULE_TEST_SURFACE_SWR_KEY("installation-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
