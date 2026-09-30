import { describe, expect, it } from "vitest"
import { isTopUpSession, parseCheckoutFields } from "./waypoint.guards"

describe("isTopUpSession", () => {
    it("accepts complete payment evidence", () => {
        expect(isTopUpSession({ amountVnd: 25000, startingBalanceVnd: 0, referenceId: "REF-1" })).toBe(true)
    })

    it("refuses a missing field, a wrong primitive and a non-object", () => {
        expect(isTopUpSession({ amountVnd: 25000, startingBalanceVnd: 0 })).toBe(false)
        expect(isTopUpSession({ amountVnd: "25000", startingBalanceVnd: 0, referenceId: "REF-1" })).toBe(false)
        expect(isTopUpSession(null)).toBe(false)
        expect(isTopUpSession([])).toBe(false)
    })
})

describe("parseCheckoutFields", () => {
    it("answers no fields when the provider sent none", () => {
        expect(parseCheckoutFields(null)).toEqual({})
    })

    it("returns an object of text values", () => {
        expect(parseCheckoutFields('{"a":"1","b":"2"}')).toEqual({ a: "1", b: "2" })
    })

    it("refuses invalid JSON, non-objects and non-text values", () => {
        expect(parseCheckoutFields("not-json")).toBeNull()
        expect(parseCheckoutFields("[]")).toBeNull()
        expect(parseCheckoutFields('{"a":1}')).toBeNull()
    })
})
