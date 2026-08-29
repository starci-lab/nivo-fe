import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSWorkspaceSummary } from "./index"
import type { AgentWorkspaceControlCenter } from "@/modules/api/console"

const labels = { section: "Summary", status: "Status", plan: "Plan", allocation: "Allocation", host: "Host", chart: "Chart" }
const data = { workspace: { id: "workspace-1", name: "Support", status: "active", externalWorkspaceRef: null }, instance: { id: "instance-1", name: "Support", hostname: "support.test", status: "active", chartVersion: "1.0", ramMb: 1024, vcpu: 2, planCode: "pro", planRamGb: 1, planVcpu: 2 }, apps: [], runtime: null } as AgentWorkspaceControlCenter

describe("AgentOS workspace summary", () => {
    it("keeps commercial allocation separate from live runtime", () => {
        const html = renderToStaticMarkup(<AgentOSWorkspaceSummary data={data} labels={labels} />)
        expect(html).toContain("active")
        expect(html).toContain("pro")
        expect(html).toContain("1024 MB · 2 vCPU")
        expect(html).toContain("support.test")
    })
})