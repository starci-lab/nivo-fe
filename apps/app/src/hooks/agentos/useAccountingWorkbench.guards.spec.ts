import { describe, expect, it } from "vitest"
import { isCommandPayloadState } from "./useAccountingWorkbench.guards"

describe("isCommandPayloadState", () => {
    it("accepts only payloads with the optional settlement fields in their declared shape", () => {
        expect(isCommandPayloadState({ state: "ready", resultId: "result-1" })).toBe(true)
        expect(isCommandPayloadState({})).toBe(true)
        expect(isCommandPayloadState({ state: 1 })).toBe(false)
        expect(isCommandPayloadState(null)).toBe(false)
    })
})
