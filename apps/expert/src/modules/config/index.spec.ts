import { describe, expect, it } from "vitest"
import { resolveAcademyApiUrl } from "."

describe("resolveAcademyApiUrl", () => {
    it("uses the configured endpoint", () => {
        expect(resolveAcademyApiUrl("https://academy.nivo.vn/graphql", "production")).toBe("https://academy.nivo.vn/graphql")
    })

    it("falls back to the local academy API outside production only", () => {
        expect(resolveAcademyApiUrl(undefined, "development")).toBe("http://localhost:4068/graphql")
        expect(resolveAcademyApiUrl("", "test")).toBe("http://localhost:4068/graphql")
    })

    it("fails loudly when a production build has no endpoint", () => {
        expect(() => resolveAcademyApiUrl(undefined, "production")).toThrow("NEXT_PUBLIC_ACADEMY_API_URL")
        expect(() => resolveAcademyApiUrl("", "production")).toThrow("NEXT_PUBLIC_ACADEMY_API_URL")
    })
})
