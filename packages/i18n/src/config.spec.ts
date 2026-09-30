import { describe, expect, it } from "vitest"
import { createI18nConfig } from "./config"

describe("createI18nConfig", () => {
    const config = createI18nConfig({
        locales: ["vi", "en"],
        defaultLocale: "vi",
        timeZone: "Asia/Ho_Chi_Minh",
    })

    it("keeps the configured locale list, default, and time zone", () => {
        expect(config.LOCALES).toEqual(["vi", "en"])
        expect(config.DEFAULT_LOCALE).toBe("vi")
        expect(config.TIME_ZONE).toBe("Asia/Ho_Chi_Minh")
    })

    it("validates locales and resolves locale paths", () => {
        expect(config.toLocale("en")).toBe("en")
        expect(config.toLocale("fr")).toBe("vi")
        expect(config.toLocaleFromPathname("/en/account")).toBe("en")
        expect(config.toLocaleFromPathname(null)).toBe("vi")
        expect(config.isLocale("en")).toBe(true)
        expect(config.isLocale("fr")).toBe(false)
        expect(config.isLocale(null)).toBe(false)
    })
})
