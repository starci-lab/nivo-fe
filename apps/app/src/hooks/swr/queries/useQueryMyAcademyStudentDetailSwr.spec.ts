import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAcademyStudentDetailSwr } from "./useQueryMyAcademyStudentDetailSwr"
import { QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyAcademyStudentDetailSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyAcademyStudentDetailSwr("site-1", "member-1") as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_ACADEMY_STUDENT_DETAIL_SWR_KEY("site-1", "member-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
