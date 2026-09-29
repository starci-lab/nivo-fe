import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyDomainsSwr } from "./useQueryMyDomainsSwr"
import { QUERY_DOMAINS_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyDomainsSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyDomainsSwr() as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_DOMAINS_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
