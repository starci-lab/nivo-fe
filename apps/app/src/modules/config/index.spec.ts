import { describe, expect, it } from "vitest"
import { CORE_API_ORIGIN, CORE_API_URL, resolveCoreApiUrl } from "."

describe("resolveCoreApiUrl", () => {
    it("uses the configured endpoint", () => {
        expect(resolveCoreApiUrl("https://api.nivo.vn/graphql", "production")).toBe("https://api.nivo.vn/graphql")
    })

    it("falls back to the local core API outside production only", () => {
        expect(resolveCoreApiUrl(undefined, "development")).toBe("http://localhost:3068/graphql")
        expect(resolveCoreApiUrl("", "test")).toBe("http://localhost:3068/graphql")
    })

    it("fails loudly when a production build has no endpoint", () => {
        expect(() => resolveCoreApiUrl(undefined, "production")).toThrow("NEXT_PUBLIC_CORE_API_URL")
        expect(() => resolveCoreApiUrl("", "production")).toThrow("NEXT_PUBLIC_CORE_API_URL")
    })

    it("derives the origin from the resolved endpoint", () => {
        expect(CORE_API_ORIGIN).toBe(new URL(CORE_API_URL).origin)
    })
})
