import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyPodOpenclawStatusSwr } from "./useQueryMyPodOpenclawStatusSwr"
import { QUERY_POD_OPENCLAW_STATUS_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyPodOpenclawStatusSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyPodOpenclawStatusSwr() as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_POD_OPENCLAW_STATUS_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
