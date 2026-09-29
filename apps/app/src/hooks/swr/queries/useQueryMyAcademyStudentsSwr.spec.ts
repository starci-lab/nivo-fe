import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAcademyStudentsSwr } from "./useQueryMyAcademyStudentsSwr"
import { QUERY_ACADEMY_STUDENTS_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyAcademyStudentsSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyAcademyStudentsSwr("site-1") as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_ACADEMY_STUDENTS_SWR_KEY("site-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
