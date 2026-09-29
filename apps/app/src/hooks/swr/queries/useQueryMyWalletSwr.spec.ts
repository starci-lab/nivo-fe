import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyWalletSwr } from "./useQueryMyWalletSwr"
import { QUERY_WALLET_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyWalletSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyWalletSwr() as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_WALLET_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
