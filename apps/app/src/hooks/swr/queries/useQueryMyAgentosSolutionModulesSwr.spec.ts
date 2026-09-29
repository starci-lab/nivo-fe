import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosSolutionModulesSwr } from "./useQueryMyAgentosSolutionModulesSwr"
import { QUERY_AGENTOS_SOLUTION_MODULES_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyAgentosSolutionModulesSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyAgentosSolutionModulesSwr() as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_AGENTOS_SOLUTION_MODULES_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
