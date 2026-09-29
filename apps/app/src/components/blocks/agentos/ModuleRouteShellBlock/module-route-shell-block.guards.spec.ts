import { describe, expect, it } from "vitest"
import { isAgentOSModuleView } from "./module-route-shell-block.guards"

describe("AgentOS module view guard", () => {
    it("accepts every routed module view", () => {
        for (const view of ["setup", "test", "operate", "settings", "diagnostics"])
            expect(isAgentOSModuleView(view)).toBe(true)
    })

    it("rejects values outside the module route vocabulary", () => {
        expect(isAgentOSModuleView("billing")).toBe(false)
        expect(isAgentOSModuleView(null)).toBe(false)
    })
})
