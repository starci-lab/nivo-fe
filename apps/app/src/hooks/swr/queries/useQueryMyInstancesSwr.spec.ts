import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyInstancesSwr } from "./useQueryMyInstancesSwr"
import { QUERY_INSTANCES_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyInstancesSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyInstancesSwr() as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_INSTANCES_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
