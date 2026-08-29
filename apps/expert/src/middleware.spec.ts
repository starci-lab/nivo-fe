import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
    const handler = vi.fn((request: unknown) => ({ request }))
    return {
        handler,
        createMiddleware: vi.fn((routing: unknown) => {
            void routing
            return handler
        }),
    }
})

vi.mock("next-intl/middleware", () => ({
    default: mocks.createMiddleware,
}))

import middleware, { config } from "./middleware"
import { routing } from "./i18n/routing"

describe("expert locale middleware", () => {
    it("binds the declared routing and excludes API, build, verification, and file paths", () => {
        expect(mocks.createMiddleware).toHaveBeenCalledWith(routing)
        expect(config.matcher).toEqual([
            "/((?!api|_next|_vercel|.*[.].*).*)",
        ])
    })

    it("passes a page request through the next-intl handler", () => {
        const request = new Request("https://expert.test/en")

        expect(middleware(request as never)).toEqual({
            request,
        })
        expect(mocks.handler).toHaveBeenCalledWith(request)
    })
})