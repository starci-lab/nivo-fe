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

    it("keeps desktop chrome above the collapsible console rail and routed body", () => {
        const heading = defineLeafComponent("heading", {}, () => "nivo")
        const text = defineLeafComponent("text", {}, () => "Console")
        const topbar = defineContractComponent("console-desktop-topbar", { brand: heading, title: text })
        const page = defineLeafComponent("page", {}, () => "page")
        const body = defineContractComponent("console-body-main", { page })
        const sidebar = defineLeafComponent("collapsible-rail", {}, () => "navigation")
        const content = defineContractComponent("sidebar-then-body-app", { sidebar, body })
        const frame = defineContractComponent("console-topbar-over-sidebar-body", { topbar, content })

        expect(frame.slots.topbar).toBe(topbar)
        expect(frame.slots.content).toBe(content)
        expect(content.slots.sidebar).toBe(sidebar)
    })
})
