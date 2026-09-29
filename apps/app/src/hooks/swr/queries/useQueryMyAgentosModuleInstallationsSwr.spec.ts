import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosModuleInstallationsSwr } from "./useQueryMyAgentosModuleInstallationsSwr"
import { QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyAgentosModuleInstallationsSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyAgentosModuleInstallationsSwr("ws-1") as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_AGENTOS_MODULE_INSTALLATIONS_SWR_KEY("ws-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
