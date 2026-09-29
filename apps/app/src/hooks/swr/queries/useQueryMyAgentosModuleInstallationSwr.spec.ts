import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyAgentosModuleInstallationSwr } from "./useQueryMyAgentosModuleInstallationSwr"
import { QUERY_AGENTOS_MODULE_INSTALLATION_SWR_KEY } from "../swr.shared"

type QueryMockResult = { readonly key: unknown }

describe("useQueryMyAgentosModuleInstallationSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses its shared SWR key", () => {
        const result = useQueryMyAgentosModuleInstallationSwr("ws-1", "installation-1") as unknown as QueryMockResult
        expect(result.key).toEqual(QUERY_AGENTOS_MODULE_INSTALLATION_SWR_KEY("ws-1", "installation-1"))
        expect(useNivoQuery).toHaveBeenCalledOnce()
    })
})
