import { describe, expect, it, vi } from "vitest"
import { createRequestResolver } from "./request-config"

describe("createRequestResolver", () => {
    const catalogs = {
        en: { page: { title: "English" } },
        vi: { page: { title: "Vietnamese" } },
    }
    const loadMessages = vi.fn(async (locale: "en" | "vi") => catalogs[locale])
    const resolve = createRequestResolver({
        toLocale: (value): "en" | "vi" => (value === "en" || value === "vi" ? value : "vi"),
        timeZone: "Asia/Ho_Chi_Minh",
        loadMessages,
    })

    it("uses the routed locale's catalog and the configured time zone", async () => {
        loadMessages.mockClear()
        await expect(resolve("en")).resolves.toEqual({
            locale: "en",
            timeZone: "Asia/Ho_Chi_Minh",
            messages: { page: { title: "English" } },
        })
        expect(loadMessages).toHaveBeenCalledExactlyOnceWith("en")
    })

    it("loads the default catalog for an unsupported route locale", async () => {
        loadMessages.mockClear()
        const result = await resolve("fr")
        expect(result.locale).toBe("vi")
        expect(result.messages).toEqual({ page: { title: "Vietnamese" } })
        expect(loadMessages).toHaveBeenCalledExactlyOnceWith("vi")
    })
})
