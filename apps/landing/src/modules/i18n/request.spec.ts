import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ rootLocale: vi.fn() }))
vi.mock("next-intl/server", () => ({ getRequestConfig: (callback: () => Promise<unknown>) => callback }))
vi.mock("next/root-params", () => ({ locale: mocks.rootLocale }))

import requestConfig from "./request"

describe("landing request locale config", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("loads the routed catalog", async () => {
        mocks.rootLocale.mockResolvedValue("en")
        const config = await requestConfig({ requestLocale: Promise.resolve(undefined) })
        expect(config.locale).toBe("en")
        expect(config.timeZone).toBe("Asia/Ho_Chi_Minh")
        expect(config.messages).toHaveProperty("site")
    })

    it("uses Vietnamese as the fallback locale", async () => {
        mocks.rootLocale.mockResolvedValue("unknown")
        const config = await requestConfig({ requestLocale: Promise.resolve(undefined) })
        expect(config.locale).toBe("vi")
        expect(config.messages).toHaveProperty("site")
    })
})
