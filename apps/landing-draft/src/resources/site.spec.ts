import { describe, expect, it } from "vitest"
import { HOMEPAGE_COPY, HOMEPAGE_NEXT_PATHS } from "./homepage"
import { ACTIVATION_LINK, PUBLIC_SITE_URL, SITE_NAVIGATION } from "./site"

describe("public-site resources", () => {
    it("publishes the canonical brand and product distinction", () => {
        expect(HOMEPAGE_COPY.hero.title).toContain("AI-Native")
        expect(HOMEPAGE_COPY.hero.supporting).toContain("NIVO xây NIVO OS")
        expect(HOMEPAGE_COPY.operatingModel.principle).toBe("Action ≠ Outcome")
    })

    it("keeps navigation to the canonical two-level public architecture", () => {
        expect(PUBLIC_SITE_URL).toBe("https://nivo.vn")
        expect(SITE_NAVIGATION).toHaveLength(5)
        expect(SITE_NAVIGATION.every((item) => !("children" in item) || item.children.every((child) => !("children" in child)))).toBe(true)
    })

    it("does not invent the unresolved activation destination or proof objects", () => {
        expect(ACTIVATION_LINK).toBeNull()
        expect(JSON.stringify(HOMEPAGE_COPY)).not.toMatch(/\+\d|customer logo|certification/i)
        expect(HOMEPAGE_NEXT_PATHS.find((path) => path.title === "Bắt đầu")?.links).toEqual([
            { href: "/pricing", label: "Mức giá" },
        ])
    })
})
