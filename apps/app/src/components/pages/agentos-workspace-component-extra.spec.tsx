import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspacePageBase, type AgentOSWorkspacePageLabels, type AgentOSWorkspaceSection } from "./AgentOSWorkspacePage/component"

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceApplications", () => ({ AgentOSWorkspaceApplications: () => <div>applications</div> }))
vi.mock("@/components/blocks/agentos/AgentOSSolutionModuleCenter", () => ({ AgentOSSolutionModuleCenter: () => <div>solutions</div> }))
vi.mock("@/components/blocks/agentos/AgentOSWorkspaceRuntime", () => ({ AgentOSWorkspaceRuntime: () => <div>runtime</div> }))
vi.mock("@/components/blocks/agentos/AgentOSWorkspaceSummary", () => ({ AgentOSWorkspaceSummary: () => <div>summary</div> }))
vi.mock("@/components/blocks/operations/AgentOSWorkspaceOperations", () => ({ AgentOSWorkspaceOperations: () => <div>operations</div> }))
vi.mock("@/components/blocks/operations/HelmStackSnapshot", () => ({ HelmStackSnapshot: () => <div>stack</div> }))

const labels = {
    titleFallback: "Workspace", loading: "Loading", tabsLabel: "Sections",
    tabs: ["overview", "solutions", "applications", "infrastructure", "operations", "access"].map((id) => ({ id, label: id })),
    summary: {}, applications: {}, runtime: {}, stack: {}, operations: {},
} as unknown as AgentOSWorkspacePageLabels
const data = {
    workspace: { id: "workspace", name: "Agent workspace", status: "ready", externalWorkspaceRef: null },
    instance: { id: "instance", name: "Instance", hostname: "agent.test", status: "ready", chartVersion: "1", ramMb: 512, vcpu: 1, planCode: null, planRamGb: null, planVcpu: null },
    apps: [], runtime: null,
}

describe("AgentOSWorkspacePage pure sections", () => {
    it("draws every ready section and the refused fallback", () => {
        const sections: ReadonlyArray<AgentOSWorkspaceSection> = ["overview", "solutions", "applications", "access", "infrastructure", "operations"]
        for (const section of sections) {
            const html = renderToStaticMarkup(<AgentOSWorkspacePageBase
                state="ready" data={data} section={section} labels={labels} launchState="idle" openClawLaunchHref="#"
                onSelectSection={vi.fn()} onOpenAgentConsole={vi.fn()} formatDate={(value) => value}
            />)
            expect(html).toContain("Agent workspace")
            if (section === "overview") {
                expect(html).toContain('data-node="workspace-overview-grid"')
                expect(html).toContain("summary")
                expect(html).toContain("runtime")
            }
        }
        const refused = renderToStaticMarkup(<AgentOSWorkspacePageBase
            state="refused" message="Unavailable" section="overview" labels={labels} launchState="idle" openClawLaunchHref="#"
            onSelectSection={vi.fn()} onOpenAgentConsole={vi.fn()} formatDate={(value) => value}
        />)
        expect(refused).toContain("Unavailable")
        expect(refused).not.toContain("Return to workspace list")
        expect(refused).not.toContain("Retry reading solutions")
    })
})
