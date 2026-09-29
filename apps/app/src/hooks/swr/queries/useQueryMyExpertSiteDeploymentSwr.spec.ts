import { beforeEach, describe, expect, it, vi } from "vitest"

const { useNivoQuery } = vi.hoisted(() => ({
    useNivoQuery: vi.fn((key: unknown, query: unknown, options?: unknown) => ({ key, query, options })),
}))
vi.mock("../useNivoQuery", () => ({ useNivoQuery }))

import { useQueryMyExpertSiteDeploymentSwr } from "./useQueryMyExpertSiteDeploymentSwr"
import { QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY } from "../swr.shared"

type DeploymentHook = { readonly key: unknown; readonly options: { readonly refreshInterval: number } }

describe("useQueryMyExpertSiteDeploymentSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("keeps the site key and existing opt-in refresh interval", () => {
        const idle = useQueryMyExpertSiteDeploymentSwr("site-1") as unknown as DeploymentHook
        expect(idle.key).toEqual(QUERY_EXPERT_SITE_DEPLOYMENT_SWR_KEY("site-1"))
        expect(idle.options.refreshInterval).toBe(0)

        const polling = useQueryMyExpertSiteDeploymentSwr("site-1", true) as unknown as DeploymentHook
        expect(polling.options.refreshInterval).toBe(4_000)
    })

    it("mounts no read without a site identity", () => {
        expect((useQueryMyExpertSiteDeploymentSwr() as unknown as DeploymentHook).key).toBeNull()
    })
})
