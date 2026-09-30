import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyExpertSitesSwr } from "./useQueryMyExpertSitesSwr"
import { QUERY_EXPERT_SITES_SWR_KEY } from "../swr.shared"


describe("useQueryMyExpertSitesSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = runAndReadMock(() => useQueryMyExpertSitesSwr(), useNivoQuery)
        expect(result.key).toEqual(QUERY_EXPERT_SITES_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
