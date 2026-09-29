import { describe, expect, it } from "vitest"
import { isLocale } from "./config.guards"

describe("locale guards", () => {
    it("accepts only locales configured for the Expert app", () => {
        expect(isLocale("vi")).toBe(true)
        expect(isLocale("en")).toBe(true)
        expect(isLocale("fr")).toBe(false)
        expect(isLocale(null)).toBe(false)
    })
})
