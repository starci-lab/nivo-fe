import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyWalletSwr } from "./useQueryMyWalletSwr"
import { QUERY_WALLET_SWR_KEY } from "../swr.shared"


describe("useQueryMyWalletSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = runAndReadMock(() => useQueryMyWalletSwr(), useNivoQuery)
        expect(result.key).toEqual(QUERY_WALLET_SWR_KEY)
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
