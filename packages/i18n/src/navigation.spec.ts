import { describe, expect, it } from "vitest"
import { createLocalizeHref } from "./navigation"

describe("createLocalizeHref", () => {
    const localize = createLocalizeHref(({ href, locale }: { readonly href: string; readonly locale: string }) =>
        locale === "vi" ? href : `/en${href}`,
    )

    it("localizes local paths and preserves query and fragment tails", () => {
        expect(localize("/company?from=home#team", "en")).toBe("/en/company?from=home#team")
        expect(localize("/company", "vi")).toBe("/company")
    })

    it("leaves external and non-path links untouched", () => {
        expect(localize("https://example.test/company", "en")).toBe("https://example.test/company")
        expect(localize("mailto:help@example.test", "en")).toBe("mailto:help@example.test")
    })
})
