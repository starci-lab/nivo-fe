import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyCatalogOrdersSwr } from "./useQueryMyCatalogOrdersSwr"
import { QUERY_CATALOG_ORDERS_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyCatalogOrdersSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyCatalogOrdersSwr(true) as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_CATALOG_ORDERS_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
