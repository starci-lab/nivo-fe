import { describe, expect, it } from "vitest"
import { initialTopUpInteractionState } from "./interaction"

describe("initialTopUpInteractionState", () => {
    it("opens only for the top-up route", () => {
        expect(initialTopUpInteractionState("/en/wallet/top-up").open).toBe(true)
        expect(initialTopUpInteractionState("/en/wallet").open).toBe(false)
    })
})
