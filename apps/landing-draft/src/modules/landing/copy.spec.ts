import { describe, expect, it } from "vitest"
import { LANDING_COPY, LANDING_DESCRIPTION } from "./copy"

describe("landing copy", () => {
    it("provides a non-empty localized description", () => {
        expect(LANDING_DESCRIPTION.trim().length).toBeGreaterThan(0)
        expect(LANDING_DESCRIPTION).toContain("System of Responsibility")
        expect(LANDING_COPY.hero.title).toContain("Founder")
        expect(LANDING_COPY.offer.price).toBe("499.000")
        expect(LANDING_COPY.hero.note).toContain("Không cần thẻ")
    })
})
