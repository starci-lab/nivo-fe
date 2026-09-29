import { describe, expect, it } from "vitest"
import { flattenFixture, parseOverride, setScenarioPath } from "./kind-test-workbench"

describe("AgentOS kind test workbench values", () => {
    it("keeps nested JSON arrays as one edited fixture value", () => {
        expect(parseOverride('["safe", {"count": 2}]', ["original"])).toEqual(["safe", { count: 2 }])
        expect(parseOverride("[1e400]", [0])).toEqual(["[1e400]"])
    })

    it("updates one dotted scenario path without replacing its sibling values", () => {
        const fixture = { nested: { keep: "same", change: false } }
        expect(setScenarioPath(fixture, "nested.change", true)).toEqual({
            nested: { keep: "same", change: true },
        })
        expect(flattenFixture(fixture)).toEqual([
            { path: "nested.keep", value: "same" },
            { path: "nested.change", value: false },
        ])
    })
})
