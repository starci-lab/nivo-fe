import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosModuleTestSurfaceSwr } from "./useQueryMyAgentosModuleTestSurfaceSwr"
import { QUERY_AGENTOS_MODULE_TEST_SURFACE_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyAgentosModuleTestSurfaceSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyAgentosModuleTestSurfaceSwr("installation-1", true) as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_AGENTOS_MODULE_TEST_SURFACE_SWR_KEY("installation-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
