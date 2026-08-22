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

    it("keeps one global navbar above the collapsible console rail and routed body", () => {
        const heading = defineLeafComponent("heading", {}, () => "nivo")
        const text = defineLeafComponent("text", {}, () => "Console")
        const locale = defineLeafComponent("language-menu", {}, () => "locale")
        const theme = defineLeafComponent("theme-switch", {}, () => "theme")
        const account = defineLeafComponent("account-menu", {}, () => "account")
        const identity = defineContractComponent("console-navbar-identity", { brand: heading, context: text })
        const tools = defineContractComponent("console-navbar-tools", { locale, theme, account })
        const topbar = defineContractComponent("console-global-navbar", { identity, tools })
        const page = defineLeafComponent("page", {}, () => "page")
        const body = defineContractComponent("console-body-main", { page })
        const sidebar = defineLeafComponent("collapsible-rail", {}, () => "navigation")
        const content = defineContractComponent("sidebar-then-body-app", { sidebar, body })
        const frame = defineContractComponent("console-topbar-over-sidebar-body", { topbar, content })

        expect(frame.slots.topbar).toBe(topbar)
        expect(frame.slots.content).toBe(content)
        expect(content.slots.sidebar).toBe(sidebar)
    })

    it("keeps wallet rows joined and balance actions inside the padded balance body", () => {
        const fact = defineContractComponent("label-value-row", {
            label: defineLeafComponent("text", { size: "sm" }, () => "Balance"),
            value: defineLeafComponent("text", { size: "sm" }, () => "100,000 VND"),
        })
        const facts = defineContractComponent("labelled-fact-stack", { fact: [fact] })
        const action = defineLeafComponent("button", {}, () => "Top up")
        const shortcuts = defineContractComponent("inline-action-run", { action: [action] })
        const balance = defineContractComponent("wallet-balance-surface", { facts, shortcuts })

        expect(balance.slots.facts).toBe(facts)
        expect(balance.slots.shortcuts).toBe(shortcuts)
    })
})
