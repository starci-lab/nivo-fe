import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyExpertSiteLeadsSwr } from "./useQueryMyExpertSiteLeadsSwr"
import { QUERY_EXPERT_SITE_LEADS_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyExpertSiteLeadsSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyExpertSiteLeadsSwr("site-1") as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_EXPERT_SITE_LEADS_SWR_KEY("site-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
