import { describe, expect, it } from "vitest"
import { collabFallbackInterval } from "."

describe("collabFallbackInterval", () => {
    it("polls nothing while the hint channel is up or has not been asked for yet", () => {
        for (const status of ["idle", "connecting", "subscribed"] as const) {
            expect(collabFallbackInterval(status, "group")).toBe(0)
            expect(collabFallbackInterval(status, "notices")).toBe(0)
        }
    })

    it("falls back to a conservative poll only once the channel is lost or refused", () => {
        expect(collabFallbackInterval("disconnected", "group")).toBe(5_000)
        expect(collabFallbackInterval("disconnected", "notices")).toBe(15_000)
    })
})
