import { describe, expect, it } from "vitest"
import en from "../../messages/en.json"
import vi from "../../messages/vi.json"
import { MESSAGE_SCOPES, pickMessages } from "./messages"

describe("pickMessages", () => {
    it("keeps only the named namespaces, untouched", () => {
        const messages = { app: { a: "1" }, console: { b: "2" }, authentication: { c: "3" } }
        expect(pickMessages(messages, ["app", "authentication"])).toEqual({
            app: { a: "1" },
            authentication: { c: "3" },
        })
    })

    it("skips a namespace the catalogue does not have", () => {
        expect(pickMessages({ app: { a: "1" } }, ["app", "slot"])).toEqual({ app: { a: "1" } })
    })
})

describe("MESSAGE_SCOPES", () => {
    it.each([
        ["en", en],
        ["vi", vi],
    ] as const)("names only top-level namespaces the %s catalogue has", (_locale, catalogue) => {
        for (const namespaces of Object.values(MESSAGE_SCOPES)) {
            for (const namespace of namespaces) expect(Object.keys(catalogue)).toContain(namespace)
        }
    })

    it("ships the sign-in door far less than the console, and the console every namespace the catalogue has", () => {
        const size = (namespaces: ReadonlyArray<string>) => JSON.stringify(pickMessages(en, namespaces)).length
        expect(size(MESSAGE_SCOPES.authentication)).toBeLessThan(size(MESSAGE_SCOPES.console) / 5)
        expect(Object.keys(pickMessages(en, MESSAGE_SCOPES.console)).sort()).toEqual(Object.keys(en).sort())
    })

    it("ships the AgentOS routes the console and agentos namespaces and nothing else", () => {
        expect(Object.keys(pickMessages(en, MESSAGE_SCOPES.agentos)).sort()).toEqual(["agentos", "console"])
    })
})
