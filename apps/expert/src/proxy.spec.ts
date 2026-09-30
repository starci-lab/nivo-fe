import { describe, expect, it, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"

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

import { config, proxy } from "./proxy"
import { routing } from "@/modules/i18n"

describe("proxy", () => {
    it("binds the declared routing and excludes API, build, verification, and file paths", () => {
        expect(mocks.createMiddleware).toHaveBeenCalledWith(routing)
        expect(config.matcher).toEqual(["/((?!api|_next|_vercel|.*[.].*).*)"])
    })

    it("passes a page request through the next-intl handler", () => {
        const request = new NextRequest("https://expert.test/en")

        expect(proxy(request)).toEqual({
            request,
        })
        expect(mocks.handler).toHaveBeenCalledWith(request)
    })

    it("stands aside for a request that already looped through the self-proxy", () => {
        const request = new NextRequest("https://expert.test/en", {
            headers: { "x-forwarded-host": "expert.test" },
        })

        expect(proxy(request)).toBeInstanceOf(NextResponse)
        expect(mocks.handler).not.toHaveBeenCalledWith(request)
    })

    it("resolves a forwarded request outside the default-locale prefix", () => {
        const request = new NextRequest("https://expert.test/vi", {
            headers: { "x-forwarded-host": "expert.test" },
        })

        expect(proxy(request)).toEqual({ request })
        expect(mocks.handler).toHaveBeenCalledWith(request)
    })
})
