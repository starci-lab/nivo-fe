import { describe, expect, it } from "vitest"
import { LANDING_DESCRIPTION } from "./copy"

describe("landing copy", () => {
    it("provides a non-empty localized description", () => {
        expect(LANDING_DESCRIPTION.trim().length).toBeGreaterThan(0)
        expect(LANDING_DESCRIPTION).toContain("sản phẩm")
    })
})