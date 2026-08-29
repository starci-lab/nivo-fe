import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSWorkspaceOperations } from "./index"

describe("AgentOS workspace operations", () => {
    it("publishes the approved disabled lifecycle vocabulary", () => {
        const html = renderToStaticMarkup(<AgentOSWorkspaceOperations labels={{ section: "Operations", note: "Managed by support", update: "Update", plan: "Plan", backup: "Backup", reset: "Reset", rebuild: "Rebuild" }} />)
        expect(html).toContain("Managed by support")
        expect(html).toContain("Update")
        expect(html).toContain("Rebuild")
    })
})