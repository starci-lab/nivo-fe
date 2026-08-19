import { describe, expect, it } from "vitest"
import { inLocale, isSafeThemeValue } from "./template"

describe("academy template boundaries", () => {
    it("returns a bare value unchanged", () => {
        expect(inLocale("Academy", "vi")).toBe("Academy")
        expect(inLocale(undefined, "en")).toBeUndefined()
    })

    it("uses requested, default, then first authored locale", () => {
        expect(inLocale({ vi: "Xin chào", en: "Hello" }, "vi")).toBe("Xin chào")
        expect(inLocale({ vi: "Xin chào" }, "en")).toBe("Xin chào")
        expect(inLocale({ en: "Hello" }, "vi")).toBe("Hello")
    })

    it("accepts safe theme values and rejects declaration escapes", () => {
        expect(isSafeThemeValue("#0f172a")).toBe(true)
        expect(isSafeThemeValue("font-weight: 600")).toBe(true)
        expect(isSafeThemeValue("red; color: blue")).toBe(false)
        expect(isSafeThemeValue("url(https://evil.test/x)")).toBe(false)
        expect(isSafeThemeValue("<style>")).toBe(false)
    })
})
