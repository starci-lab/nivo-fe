import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    catalog: undefined as unknown,
    deployment: undefined as unknown,
    accessToken: "token" as string | null,
    trigger: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
}))
vi.mock("@/hooks", () => ({
    useAccessToken: () => mocks.accessToken,
    useMutateCreateAndPublishExpertSiteSwr: () => ({ trigger: mocks.trigger, isMutating: false }),
    useProvisioningRealtime: () => ({ status: "disconnected" }),
    useQueryCatalogItemsSwr: () => ({ data: mocks.catalog, mutate: vi.fn() }),
    useQueryMyExpertSiteDeploymentSwr: () => ({ data: mocks.deployment, mutate: vi.fn() }),
    useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
}))

import { useTemplateAppProvisioning } from "./useTemplateAppProvisioning"

describe("useTemplateAppProvisioning", () => {
    beforeEach(() => {
        mocks.catalog = {
            ok: true,
            data: [{ id: "academy", slug: "academy", name: "Academy", tagline: null, templateKey: "ai_academy", tiers: null }],
        }
        mocks.deployment = undefined
        mocks.accessToken = "token"
        mocks.trigger.mockResolvedValue({ ok: true, data: { id: "site-1", slug: "academy" } })
    })

    it("submits a named academy and routes to its deployment status", async () => {
        const { result } = renderHook(() => useTemplateAppProvisioning({ mode: "new", templateKey: "ai_academy" }))
        expect(result.current.flow).toEqual({ phase: "request", name: "Academy" })
        act(() => result.current.changeSlug(" academy "))
        await act(async () => result.current.submit())
        expect(mocks.trigger).toHaveBeenCalledWith("academy")
        expect(mocks.replace).toHaveBeenCalledWith("/apps/site-1/provisioning")
        expect(result.current.flow).toMatchObject({ phase: "accepted", siteId: "site-1" })
    })
})
