import { renderToStaticMarkup } from "react-dom/server"
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSWorkspaceSummary } from "./index"
import type { AgentWorkspaceControlCenter } from "@/modules/api/agentos-workspaces"

const labels = {
    section: "Summary",
    status: "Status",
    plan: "Plan",
    allocation: "Allocation",
    host: "Host",
    chart: "Chart",
    unprovisioned: "No instance is provisioned for this workspace yet.",
}
const data = {
    workspace: { id: "workspace-1", name: "Support", status: "active", externalWorkspaceRef: null },
    instance: {
        id: "instance-1",
        name: "Support",
        hostname: "support.test",
        status: "active",
        chartVersion: "1.0",
        ramMb: 1024,
        vcpu: 2,
        planCode: "pro",
        planRamGb: 1,
        planVcpu: 2,
    },
    apps: [],
    runtime: null,
} as AgentWorkspaceControlCenter

describe("AgentOSWorkspaceSummary", () => {
    it("has no axe violations in the resolved workspace state", async () => {
        const { container } = render(<AgentOSWorkspaceSummary data={data} labels={labels} />)

        await expectNoA11yViolations(container)
    })

    it("keeps commercial allocation separate from live runtime", () => {
        const html = renderToStaticMarkup(<AgentOSWorkspaceSummary data={data} labels={labels} />)
        expect(html).toContain("active")
        expect(html).toContain("pro")
        expect(html).toContain("1024 MB · 2 vCPU")
        expect(html).toContain("support.test")
        expect(html).not.toContain(labels.unprovisioned)
    })
    it("states that no instance is provisioned instead of reading facts from one", () => {
        const html = renderToStaticMarkup(
            <AgentOSWorkspaceSummary data={{ ...data, instance: null }} labels={labels} />,
        )
        expect(html).toContain("Status: active")
        expect(html).toContain(labels.unprovisioned)
        expect(html).not.toContain("Plan:")
        expect(html).not.toContain("vCPU")
    })
})
