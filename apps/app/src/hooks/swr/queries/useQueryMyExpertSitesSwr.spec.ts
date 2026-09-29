import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyExpertSitesSwr } from "./useQueryMyExpertSitesSwr"
import { QUERY_EXPERT_SITES_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyExpertSitesSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyExpertSitesSwr() as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_EXPERT_SITES_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
