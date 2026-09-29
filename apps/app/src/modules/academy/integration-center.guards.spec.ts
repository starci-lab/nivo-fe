import { describe, expect, it } from "vitest"
import { isAcademyIntegrationProviderId } from "./integration-center.guards"

describe("academy Integration Center guards", () => {
    it("accepts only known provider selections", () => {
        expect(isAcademyIntegrationProviderId("webhook")).toBe(true)
        expect(isAcademyIntegrationProviderId("meta_pixel")).toBe(true)
        expect(isAcademyIntegrationProviderId("other")).toBe(false)
        expect(isAcademyIntegrationProviderId(null)).toBe(false)
    })
})
