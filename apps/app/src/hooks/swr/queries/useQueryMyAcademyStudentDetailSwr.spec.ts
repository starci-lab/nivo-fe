import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAcademyStudentDetailSwr } from "./useQueryMyAcademyStudentDetailSwr"
import { QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY } from "../swr.shared"


describe("useQueryMyAcademyStudentDetailSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = runAndReadMock(() => useQueryMyAcademyStudentDetailSwr("site-1", "member-1"), useNivoQuery)
        expect(result.key).toEqual(QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY("site-1", "member-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
