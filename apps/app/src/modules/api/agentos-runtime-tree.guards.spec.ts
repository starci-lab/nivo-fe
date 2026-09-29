import { describe, expect, it } from "vitest"
import { isAgentosRuntimeRecord, isAgentosRuntimeValue } from "./agentos-runtime-tree.guards"

describe("AgentOS runtime tree guards", () => {
    it("accepts recursively JSON-shaped runtime values", () => {
        expect(isAgentosRuntimeValue({ rows: ["one", 2, true, null] })).toBe(true)
        expect(isAgentosRuntimeRecord({ rows: ["one", 2] })).toBe(true)
    })

    it("rejects values that are outside the recursive runtime contract", () => {
        expect(isAgentosRuntimeValue({ nested: [undefined] })).toBe(false)
        expect(isAgentosRuntimeValue(Number.POSITIVE_INFINITY)).toBe(false)
        expect(isAgentosRuntimeRecord(["not", "an object"])).toBe(false)
    })
})
