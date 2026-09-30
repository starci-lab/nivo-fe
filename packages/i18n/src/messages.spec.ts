import { describe, expect, it } from "vitest"
import { pickMessages } from "./messages"

describe("pickMessages", () => {
    const catalogue = { home: { title: "Home" }, boundary: { retry: "Retry" }, footer: { legal: "Legal" } }

    it("returns only the requested namespaces", () => {
        expect(pickMessages(catalogue, ["home", "footer"])).toEqual({
            home: { title: "Home" },
            footer: { legal: "Legal" },
        })
    })

    it("skips a namespace the catalogue does not have", () => {
        expect(pickMessages(catalogue, ["home", "missing"])).toEqual({ home: { title: "Home" } })
    })
})
