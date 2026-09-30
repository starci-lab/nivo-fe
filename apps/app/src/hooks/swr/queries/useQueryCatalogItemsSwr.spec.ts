import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryCatalogItemsSwr } from "./useQueryCatalogItemsSwr"
import { QUERY_CATALOG_ITEMS_SWR_KEY } from "../swr.shared"


describe("useQueryCatalogItemsSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = runAndReadMock(() => useQueryCatalogItemsSwr("site_from_template", true), useNivoQuery)
        expect(result.key).toEqual(QUERY_CATALOG_ITEMS_SWR_KEY("site_from_template"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
