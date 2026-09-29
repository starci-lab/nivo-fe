import { beforeEach, describe, expect, it, vi } from "vitest"
import { redirect } from "next/navigation"
import Page from "./page"

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}))

describe("Page", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("redirects the retired creation route to the accepted purchase entry", async () => {
        await Page({
            params: Promise.resolve({
                locale: "vi",
            }),
        })
        await Page({
            params: Promise.resolve({
                locale: "en",
            }),
        })
        expect(redirect).toHaveBeenNthCalledWith(1, "/agentos/workspaces/new")
        expect(redirect).toHaveBeenNthCalledWith(2, "/en/agentos/workspaces/new")
    })
})
