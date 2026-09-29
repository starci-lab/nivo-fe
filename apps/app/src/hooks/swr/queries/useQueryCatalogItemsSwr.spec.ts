import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryCatalogItemsSwr } from "./useQueryCatalogItemsSwr"
import { QUERY_CATALOG_ITEMS_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryCatalogItemsSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryCatalogItemsSwr("site_from_template", true) as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_CATALOG_ITEMS_SWR_KEY("site_from_template"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
