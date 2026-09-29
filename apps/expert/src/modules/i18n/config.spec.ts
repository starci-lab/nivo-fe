import { describe, expect, it } from "vitest"
import { DEFAULT_LOCALE, toLocale } from "./config"

describe("locale configuration", () => {
    it("keeps Vietnamese as the default", () => {
        expect(DEFAULT_LOCALE).toBe("vi")
    })

    it("accepts shipped locales and falls back for unknown values", () => {
        expect(toLocale("vi")).toBe("vi")
        expect(toLocale("en")).toBe("en")
        expect(toLocale("fr")).toBe("vi")
        expect(toLocale(undefined)).toBe("vi")
    })
})
