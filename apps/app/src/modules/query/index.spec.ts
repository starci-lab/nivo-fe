import { describe, expect, it } from "vitest"
import { nivoAnswerDenied, nivoQueryData } from "."

describe("nivoQueryData", () => {
    it("preserves loading, accepted data and refusal as distinct states", () => {
        expect(nivoQueryData(undefined)).toBeUndefined()
        expect(nivoQueryData({ ok: true, data: { id: "one" } })).toEqual({ id: "one" })
        expect(nivoQueryData({ ok: false, kind: "unavailable" })).toBeNull()
    })
})

describe("nivoAnswerDenied", () => {
    it("is true only for an answer that says the viewer may not have the read", () => {
        expect(nivoAnswerDenied({ ok: false, kind: "refused" })).toBe(true)
        expect(nivoAnswerDenied({ ok: false, kind: "forbidden" })).toBe(true)
    })

    it("is false for a fault the viewer could retry, a missing thing, a settled answer and a read in flight", () => {
        expect(nivoAnswerDenied({ ok: false, kind: "unavailable" })).toBe(false)
        expect(nivoAnswerDenied({ ok: false, kind: "not-found" })).toBe(false)
        expect(nivoAnswerDenied({ ok: false, kind: "invalid" })).toBe(false)
        expect(nivoAnswerDenied({ ok: true, data: 1 })).toBe(false)
        expect(nivoAnswerDenied(undefined)).toBe(false)
    })
})
