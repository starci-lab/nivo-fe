import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyInvoicesSwr } from "./useQueryMyInvoicesSwr"
import { QUERY_INVOICES_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyInvoicesSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyInvoicesSwr(true) as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_INVOICES_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
