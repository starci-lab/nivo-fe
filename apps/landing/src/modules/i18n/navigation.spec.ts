import { describe, expect, it } from "vitest"
import { localizeHref } from "./navigation"

describe("landing localized hrefs", () => {
    it("adds the prefix for English and keeps the Vietnamese default bare", () => {
        expect(localizeHref("/company?from=home", "en")).toBe("/en/company?from=home")
        expect(localizeHref("/company", "vi")).toBe("/company")
    })

    it("leaves external links alone", () => {
        expect(localizeHref("https://example.test/company", "en")).toBe("https://example.test/company")
    })
})
