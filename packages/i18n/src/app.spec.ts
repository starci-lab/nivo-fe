import { beforeEach, describe, expect, it, vi } from "vitest"

import { createAppI18n } from "./app"

const i18n = createAppI18n({
    locales: ["vi", "en"],
    defaultLocale: "vi",
    timeZone: "Asia/Ho_Chi_Minh",
})

describe("createAppI18n", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("creates locale values, validators, and locale-aware navigation from one configuration", () => {
        expect(i18n.LOCALES).toEqual(["vi", "en"])
        expect(i18n.DEFAULT_LOCALE).toBe("vi")
        expect(i18n.TIME_ZONE).toBe("Asia/Ho_Chi_Minh")
        expect(i18n.toLocale("en")).toBe("en")
        expect(i18n.toLocale("fr")).toBe("vi")
        expect(i18n.toLocaleFromPathname("/en/company")).toBe("en")
        expect(i18n.toLocaleFromPathname(null)).toBe("vi")
        expect(i18n.isLocale("vi")).toBe(true)
        expect(i18n.isLocale("fr")).toBe(false)
        expect(i18n.isLocale(null)).toBe(false)

        expect(i18n.routing.locales).toEqual(["vi", "en"])
        expect(i18n.routing.defaultLocale).toBe("vi")
        expect(i18n.routing.localePrefix).toBe("as-needed")
        expect(i18n.getPathname({ href: "/company", locale: "vi" })).toBe("/company")
        expect(i18n.getPathname({ href: "/company", locale: "en" })).toBe("/en/company")
        expect(i18n.Link).toBe(i18n.navigation.Link)
        expect(i18n.redirect).toBe(i18n.navigation.redirect)
        expect(typeof i18n.navigation.usePathname).toBe("function")
        expect(typeof i18n.navigation.useRouter).toBe("function")
    })

    it("localizes local hrefs while preserving query and fragment tails", () => {
        expect(i18n.localizeHref("/company?from=home#team", "en")).toBe("/en/company?from=home#team")
        expect(i18n.localizeHref("/company", "vi")).toBe("/company")
        expect(i18n.localizeHref("https://example.test/company", "en")).toBe("https://example.test/company")
        expect(i18n.localizeHref("mailto:help@example.test", "en")).toBe("mailto:help@example.test")
    })

})
