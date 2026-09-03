import { describe, expect, it } from "vitest"
import { nivoQueryData } from "."

describe("nivoQueryData", () => {
    it("preserves loading, accepted data and refusal as distinct states", () => {
        expect(nivoQueryData(undefined)).toBeUndefined()
        expect(nivoQueryData({ ok: true, data: { id: "one" } })).toEqual({ id: "one" })
        expect(nivoQueryData({ ok: false })).toBeNull()
    })
})
