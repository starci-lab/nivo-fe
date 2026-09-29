import { describe, expect, it } from "vitest"
import { createRouting } from "./routing"

describe("createRouting", () => {
    it("uses the app's locale list and default with as-needed prefixes", () => {
        const routing = createRouting({ locales: ["en", "vi"], defaultLocale: "en" })

        expect(routing.locales).toEqual(["en", "vi"])
        expect(routing.defaultLocale).toBe("en")
        expect(routing.localePrefix).toBe("as-needed")
    })
})
