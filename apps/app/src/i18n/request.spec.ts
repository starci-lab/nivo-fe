import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ rootLocale: vi.fn() }))
vi.mock("next-intl/server", () => ({ getRequestConfig: (callback: (request: unknown) => Promise<unknown>) => callback }))
vi.mock("next/root-params", () => ({ locale: mocks.rootLocale }))

import requestConfig from "./request"

describe("app request locale config", () => {
    beforeEach(() => { vi.clearAllMocks() })

    it("loads Vietnamese messages for a routed Vietnamese request", async () => {
        mocks.rootLocale.mockResolvedValue("vi")
        const config = await requestConfig({ requestLocale: Promise.resolve("vi") })
        expect(config.locale).toBe("vi")
        expect(config.timeZone).toBe("Asia/Ho_Chi_Minh")
        expect(config.messages).toHaveProperty("console")
    })

    it("falls back to the default locale for an unknown route value", async () => {
        mocks.rootLocale.mockResolvedValue("xx")
        const config = await requestConfig({ requestLocale: Promise.resolve("xx") })
        expect(config.locale).toBe("vi")
        expect(config.messages).toHaveProperty("console")
    })
})