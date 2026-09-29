import { beforeEach, describe, expect, it, vi } from "vitest"
import { redirect } from "next/navigation"
import LegacyTemplateRoute from "./page"

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}))

describe("LegacyTemplateRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("keeps the canonical template route and both localized legacy redirects", async () => {
        await LegacyTemplateRoute({
            params: Promise.resolve({
                locale: "vi",
                templateKey: "academy starter",
            }),
        })
        await LegacyTemplateRoute({
            params: Promise.resolve({
                locale: "en",
                templateKey: "academy starter",
            }),
        })
        expect(redirect).toHaveBeenNthCalledWith(1, "/apps/create/academy%20starter")
        expect(redirect).toHaveBeenNthCalledWith(2, "/en/apps/create/academy%20starter")
    })
})
