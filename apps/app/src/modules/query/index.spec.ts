import { describe, expect, it } from "vitest"
import { nivoAnswerDenied, nivoQueryPayload, nivoQueryReading } from "."

describe("nivoQueryReading", () => {
    it("keeps a read in flight, accepted data and a failed settlement as three distinct states", () => {
        expect(nivoQueryReading(undefined)).toEqual({ status: "resting" })
        expect(nivoQueryReading({ ok: true, data: { id: "one" } })).toEqual({
            status: "ready",
            data: { id: "one" },
        })
        expect(nivoQueryReading({ ok: false, kind: "forbidden" })).toMatchObject({
            status: "failed",
            kind: "forbidden",
        })
    })

    it("keeps every fact a failed answer states: kind, code, reason and retryability", () => {
        expect(
            nivoQueryReading({
                ok: false,
                kind: "unavailable",
                code: "NETWORK",
                reason: "The read timed out.",
                retryable: true,
            }),
        ).toEqual({ status: "failed", kind: "unavailable", code: "NETWORK", reason: "The read timed out.", retryable: true })
    })

    it("defaults an unstated retryability the way the answer's own kind defaults it", () => {
        expect(nivoQueryReading({ ok: false, kind: "unavailable" })).toMatchObject({ retryable: true })
        expect(nivoQueryReading({ ok: false, kind: "not-found" })).toMatchObject({ retryable: false })
        expect(nivoQueryReading({ ok: false, kind: "invalid" })).toMatchObject({ retryable: false })
        expect(nivoQueryReading({ ok: false, kind: "refused" })).toMatchObject({ retryable: false })
        expect(nivoQueryReading({ ok: false, kind: "forbidden" })).toMatchObject({ retryable: false })
    })
})

describe("nivoQueryPayload", () => {
    it("hands over only an accepted answer's data and nothing else", () => {
        expect(nivoQueryPayload(undefined)).toBeUndefined()
        expect(nivoQueryPayload({ ok: false, kind: "refused" })).toBeUndefined()
        expect(nivoQueryPayload({ ok: true, data: 1 })).toBe(1)
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
