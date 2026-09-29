import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ rootLocale: vi.fn() }))
vi.mock("next-intl/server", () => ({ getRequestConfig: (callback: () => Promise<unknown>) => callback }))
vi.mock("next/root-params", () => ({ locale: mocks.rootLocale }))

import { createRequestConfig } from "./request"

describe("createRequestConfig", () => {
    const catalogs = {
        en: { page: { title: "English" } },
        vi: { page: { title: "Vietnamese" } },
    }
    const loadMessages = vi.fn(async (locale: "en" | "vi") => catalogs[locale])
    const requestConfig = createRequestConfig({
        toLocale: (value): "en" | "vi" => (value === "en" || value === "vi" ? value : "vi"),
        timeZone: "Asia/Ho_Chi_Minh",
        loadMessages,
    })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("uses the routed locale's catalog and the configured time zone", async () => {
        mocks.rootLocale.mockResolvedValue("en")
        await expect(requestConfig({ requestLocale: Promise.resolve(undefined) })).resolves.toEqual({
            locale: "en",
            timeZone: "Asia/Ho_Chi_Minh",
            messages: { page: { title: "English" } },
        })
        expect(loadMessages).toHaveBeenCalledExactlyOnceWith("en")
    })

    it("loads the default catalog for an unsupported route locale", async () => {
        mocks.rootLocale.mockResolvedValue("fr")
        const result = await requestConfig({ requestLocale: Promise.resolve(undefined) })
        expect(result.locale).toBe("vi")
        expect(result.messages).toEqual({ page: { title: "Vietnamese" } })
        expect(loadMessages).toHaveBeenCalledExactlyOnceWith("vi")
    })
})
