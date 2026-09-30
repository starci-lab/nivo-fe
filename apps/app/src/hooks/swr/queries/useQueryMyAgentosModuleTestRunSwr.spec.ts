import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosModuleTestRunSwr } from "./useQueryMyAgentosModuleTestRunSwr"
import { QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY } from "../swr.shared"


describe("useQueryMyAgentosModuleTestRunSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = runAndReadMock(() => useQueryMyAgentosModuleTestRunSwr("installation-1", "run-1"), useNivoQuery)
        expect(result.key).toEqual(QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY("installation-1", "run-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
