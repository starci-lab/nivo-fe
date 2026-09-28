import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"

import { isStandaloneSelfProxy } from "./standalone-self-proxy"

const request = (url: string, forwarded = true) =>
    new NextRequest(url, forwarded ? { headers: { "x-forwarded-host": "localhost:3067" } } : undefined)

describe("isStandaloneSelfProxy", () => {
    it("identifies a self-proxied request that landed on the default-locale prefix", () => {
        expect(isStandaloneSelfProxy(request("http://localhost:3067/vi/agentos"))).toBe(true)
        expect(isStandaloneSelfProxy(request("http://localhost:3067/vi"))).toBe(true)
    })

    it("passes a directly-requested default-locale prefix through to locale resolution", () => {
        expect(isStandaloneSelfProxy(request("http://localhost:3067/vi/agentos", false))).toBe(false)
    })

    it("passes a forwarded request outside the default-locale prefix through", () => {
        expect(isStandaloneSelfProxy(request("http://localhost:3067/en/agentos"))).toBe(false)
        expect(isStandaloneSelfProxy(request("http://localhost:3067/agentos"))).toBe(false)
    })
})
