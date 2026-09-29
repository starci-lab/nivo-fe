import { describe, expect, it } from "vitest"
import { HOMEPAGE_NEXT_PATHS, homepageStructuredData } from "./homepage"
import { PUBLIC_SITE_URL, SITE_FOOTER_GROUPS, SITE_NAVIGATION } from "./site"

describe("public-site resources", () => {
    it("keeps navigation to the canonical two-level public architecture", () => {
        expect(PUBLIC_SITE_URL).toBe("https://nivo.vn")
        expect(SITE_NAVIGATION).toHaveLength(5)
        expect(
            SITE_NAVIGATION.every(
                (item) => !("children" in item) || item.children.every((child) => !("children" in child)),
            ),
        ).toBe(true)
    })

    it("holds structure only: every entry is an id and an address, never a sentence", () => {
        const entries = [...SITE_NAVIGATION, ...SITE_FOOTER_GROUPS, ...HOMEPAGE_NEXT_PATHS]
        expect(
            entries.every((entry) =>
                Object.keys(entry).every((key) => ["id", "href", "children", "links", "external"].includes(key)),
            ),
        ).toBe(true)
        expect(HOMEPAGE_NEXT_PATHS.find((path) => path.id === "start")?.links).toEqual([
            { id: "pricing", href: "/pricing" },
        ])
    })

    it("names the language of the page in the structured data and cannot close its own script element", () => {
        const data = homepageStructuredData({ locale: "vi", name: "</script>" })
        expect(data).toContain('"inLanguage":"vi"')
        expect(data).not.toContain("<")
    })
})
