import { describe, expect, it } from "vitest"
import { defineContractComponent, defineLeafComponent } from "./props"

describe("contract helper slot shapes", () => {
    it("retains optional and repeated slot values without invoking them", () => {
        const leaf = defineLeafComponent("button", {}, () => "value")
        const component = defineContractComponent("inline-action-run", { action: [leaf, leaf] })
        expect(component.kind).toBe("slots")
        expect(component.slots.action).toHaveLength(2)
        expect(component.slots.action[0]).toBe(leaf)
    })
})
