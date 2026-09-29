import { describe, expect, it } from "vitest"
import { DEFAULT_LOCALE, isLocale, toLocale } from "./config"

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

    it("narrows only values from the shipped locale vocabulary", () => {
        expect(isLocale("vi")).toBe(true)
        expect(isLocale("en")).toBe(true)
        expect(isLocale("fr")).toBe(false)
        expect(isLocale(null)).toBe(false)
    })
})
