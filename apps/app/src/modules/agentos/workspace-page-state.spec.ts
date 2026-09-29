import { describe, expect, it } from "vitest"
import { isAgentOSWorkspacePageState } from "./workspace-page-state"

describe("AgentOS workspace page state guard", () => {
    it("accepts the page's supported query values", () => {
        for (const state of [
            "overview",
            "solutions",
            "ai-knowledge",
            "applications",
            "infrastructure",
            "operations",
            "access",
        ])
            expect(isAgentOSWorkspacePageState(state)).toBe(true)
    })

    it("rejects query values outside the page state vocabulary", () => {
        expect(isAgentOSWorkspacePageState("billing")).toBe(false)
        expect(isAgentOSWorkspacePageState(null)).toBe(false)
    })
})
