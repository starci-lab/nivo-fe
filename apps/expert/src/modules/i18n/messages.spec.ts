import { describe, expect, it } from "vitest"
import en from "../../messages/en.json"
import vi from "../../messages/vi.json"
import { CLIENT_NAMESPACES, pickMessages } from "./messages"

describe("CLIENT_NAMESPACES", () => {
    it.each([
        ["en", en],
        ["vi", vi],
    ] as const)("names only top-level namespaces the %s catalogue has", (_locale, catalogue) => {
        for (const namespace of CLIENT_NAMESPACES) expect(Object.keys(catalogue)).toContain(namespace)
    })

    it("leaves the server-only metadata namespace out of the client slice", () => {
        expect(Object.keys(pickMessages(en, CLIENT_NAMESPACES))).not.toContain("metadata")
    })
})
