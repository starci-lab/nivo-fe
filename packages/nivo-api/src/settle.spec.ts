import { describe, expect, it } from "vitest"
import { settle } from "./settle"

describe("settle", () => {
    it("wraps a resolved value in an ok outcome", async () => {
        await expect(settle(() => Promise.resolve(7))).resolves.toEqual({ ok: true, data: 7 })
    })

    it("turns a rejection into an unavailable failure with the thrown reason", async () => {
        const outcome = await settle(() => Promise.reject(new Error("offline")))
        expect(outcome).toMatchObject({ ok: false, kind: "unavailable", code: "REJECTED", reason: "offline", retryable: true })
    })

    it("uses a fixed reason when the rejection is not an Error", async () => {
        const outcome = await settle(() => Promise.reject("boom"))
        expect(outcome).toMatchObject({ ok: false, kind: "unavailable", reason: "The call did not answer." })
    })
})
