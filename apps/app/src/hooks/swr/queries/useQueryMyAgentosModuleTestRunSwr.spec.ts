import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosModuleTestRunSwr } from "./useQueryMyAgentosModuleTestRunSwr"
import { QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyAgentosModuleTestRunSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyAgentosModuleTestRunSwr("installation-1", "run-1") as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_AGENTOS_MODULE_TEST_RUN_SWR_KEY("installation-1", "run-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
