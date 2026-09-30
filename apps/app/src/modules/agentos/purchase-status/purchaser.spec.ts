import { describe, expect, it } from "vitest"
import { purchaserClaimsOf } from "./purchaser"

const tokenOf = (payload: string): string => `header.${globalThis.btoa(payload)}.signature`

describe("purchaserClaimsOf", () => {
    it("decodes the claims object of a token", () => {
        expect(purchaserClaimsOf(tokenOf('{"name":"Ada","email":"ada@example.com"}'))).toEqual({
            name: "Ada",
            email: "ada@example.com",
        })
    })

    it("answers no claims for a payload that is not an object, not JSON or absent", () => {
        expect(purchaserClaimsOf(tokenOf("[1]"))).toEqual({})
        expect(purchaserClaimsOf(tokenOf("null"))).toEqual({})
        expect(purchaserClaimsOf("header.%%%.signature")).toEqual({})
        expect(purchaserClaimsOf("opaque")).toEqual({})
    })
})
