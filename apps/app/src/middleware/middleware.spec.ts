import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"

import middleware from "../middleware"

describe("locale middleware", () => {
    it("renders a self-proxied default-locale sub-request in place instead of canonicalizing it", () => {
        // The standalone router proxies an external-classified rewrite back to itself; the
        // sub-request must render where it landed or the locale redirect loops the client.
        const response = middleware(new NextRequest("http://localhost:3067/vi/agentos", {
            headers: { "x-forwarded-host": "localhost:3067" },
        }))
        expect(response.headers.get("location")).toBeNull()
        expect(response.headers.get("x-middleware-rewrite")).toBeNull()
    })

    it("rewrites an unprefixed default-locale route to its locale segment", () => {
        const response = middleware(new NextRequest("http://localhost:3067/agentos"))
        expect(response.headers.get("x-middleware-rewrite")).toBe("http://localhost:3067/vi/agentos")
    })

    it("canonicalizes a directly-requested default-locale prefix", () => {
        const response = middleware(new NextRequest("http://localhost:3067/vi/agentos"))
        expect(response.headers.get("x-middleware-rewrite")).toBeNull()
        expect(response.headers.get("location")).toBe("http://localhost:3067/agentos")
    })

    it("serves an English-prefixed route without a rewrite", () => {
        const response = middleware(new NextRequest("http://localhost:3067/en/agentos"))
        expect(response.headers.get("x-middleware-rewrite")).toBeNull()
    })
})
