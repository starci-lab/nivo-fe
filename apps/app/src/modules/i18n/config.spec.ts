import { describe, expect, it } from "vitest"
import { DEFAULT_LOCALE, LOCALES, TIME_ZONE, toLocale } from "./config"

describe("app locale settings", () => {
    it("keeps Vietnamese as the default and validates the shipped locales", () => {
        expect(LOCALES).toEqual(["vi", "en"])
        expect(DEFAULT_LOCALE).toBe("vi")
        expect(TIME_ZONE).toBe("Asia/Ho_Chi_Minh")
        expect(toLocale("en")).toBe("en")
        expect(toLocale("fr")).toBe("vi")
    })
})
