import { runAndReadMock } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

type NivoQueryMockOptions = {
    readonly refreshInterval?: number | ((data: unknown, error?: unknown) => number)
}

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: (...args: Array<unknown>) => unknown, options?: NivoQueryMockOptions) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyExpertSiteDeploymentSwr } from "./useQueryMyExpertSiteDeploymentSwr"
import { QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY } from "../swr.shared"


describe("useQueryMyExpertSiteDeploymentSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("keeps the site key and existing opt-in refresh interval", () => {
        const idle = runAndReadMock(() => useQueryMyExpertSiteDeploymentSwr("site-1"), useNivoQuery)
        expect(idle.key).toEqual(QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY("site-1"))
        expect(idle.options?.refreshInterval).toBe(0)

        const polling = runAndReadMock(() => useQueryMyExpertSiteDeploymentSwr("site-1", true), useNivoQuery)
        expect(polling.options?.refreshInterval).toBe(4_000)
    })

    it("mounts no read without a site identity", () => {
        expect((runAndReadMock(() => useQueryMyExpertSiteDeploymentSwr(), useNivoQuery)).key).toBeNull()
    })
})
