import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceSummary", () => ({ AgentOSWorkspaceSummary: () => <div>summary</div> }))
vi.mock("@/components/blocks/agentos/AgentOSWorkspaceApplications", () => ({ AgentOSWorkspaceApplications: () => <div>applications</div> }))
vi.mock("@/components/blocks/agentos/AgentOSSolutionModuleCenter", () => ({ AgentOSSolutionModuleCenter: () => <div>solutions</div> }))
vi.mock("@/components/blocks/agentos/AgentOSWorkspaceRuntime", () => ({ AgentOSWorkspaceRuntime: () => <div>runtime</div> }))
vi.mock("@/components/blocks/operations/AgentOSWorkspaceOperations", () => ({ AgentOSWorkspaceOperations: () => <div>operations</div> }))
vi.mock("@/components/blocks/operations/HelmStackSnapshot", () => ({ HelmStackSnapshot: () => <div>helm stack</div> }))

import { AgentOSWorkspaceControlCenterBase, type AgentOSWorkspaceControlCenterLabels } from "./component"

const labels = {
    titleFallback: "Workspace",
    eyebrow: "Workspace control center",
    description: "Operate this persisted workspace.",
    stateSection: "Workspace state",
    readyStatus: "Ready",
    loadingTitle: "Loading workspace",
    refusedTitle: "Workspace unavailable",
    retry: "Retry",
    loading: "Loading",
    accessUnavailable: "Access unavailable",
    tabsLabel: "Sections",
    tabs: ["overview", "solutions", "applications", "infrastructure", "operations", "access"].map((id) => ({ id, label: id })) as AgentOSWorkspaceControlCenterLabels["tabs"],
    summary: {}, applications: {}, runtime: {}, stack: {}, operations: {},
} as AgentOSWorkspaceControlCenterLabels
const data = { workspace: { id: "workspace-1", name: "Support" }, apps: [], runtime: {} } as never

const pureSectionLabels = {
    titleFallback: "Workspace", loading: "Loading", tabsLabel: "Sections",
    tabs: ["overview", "solutions", "applications", "infrastructure", "operations", "access"].map((id) => ({ id, label: id })),
    summary: {}, applications: {}, runtime: {}, stack: {}, operations: {},
} as unknown as AgentOSWorkspaceControlCenterLabels
const pureSectionData = {
    workspace: { id: "workspace", name: "Agent workspace", status: "ready", externalWorkspaceRef: null },
    instance: { id: "instance", name: "Instance", hostname: "agent.test", status: "ready", chartVersion: "1", ramMb: 512, vcpu: 1, planCode: null, planRamGb: null, planVcpu: null },
    apps: [], runtime: null,
}

describe("AgentOSWorkspaceControlCenterBase", () => {
    it("renders unsettled lifecycle notices", () => {
        const retry = vi.fn()
        const { rerender } = render(<AgentOSWorkspaceControlCenterBase workspaceId="workspace-1" pageState="overview" controlCenterState="loading" labels={labels} onSelectPageState={vi.fn()} onOpenAgentConsole={vi.fn()} onRetry={retry} openClawLaunchHref="#" launchState="idle" formatDate={(value) => value} />)
        expect(screen.getByRole("status")).toHaveTextContent("Loading workspace")
        rerender(<AgentOSWorkspaceControlCenterBase workspaceId="workspace-1" pageState="overview" controlCenterState="refused" message="Refused" labels={labels} onSelectPageState={vi.fn()} onOpenAgentConsole={vi.fn()} onRetry={retry} openClawLaunchHref="#" launchState="idle" formatDate={(value) => value} />)
        expect(screen.getByText("Refused")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("renders and selects the infrastructure composition", async () => {
        const select = vi.fn()
        render(<AgentOSWorkspaceControlCenterBase workspaceId="workspace-1" pageState="infrastructure" controlCenterState="ready" data={data} labels={labels} onSelectPageState={select} onOpenAgentConsole={vi.fn()} onRetry={vi.fn()} openClawLaunchHref="#" launchState="idle" formatDate={(value) => value} />)
        expect(screen.getByText("runtime")).toBeInTheDocument()
        expect(screen.getByText("helm stack")).toBeInTheDocument()
        await waitFor(() => expect(screen.getByRole("tab", { name: "infrastructure", selected: true })).toHaveAttribute("aria-controls", "workspace-panel-infrastructure"))
        fireEvent.click(screen.getByRole("tab", { name: "operations" }))
        expect(select).toHaveBeenCalledWith("operations")
    })

    it("draws every ready section and the refused fallback", () => {
        const pageStates: ReadonlyArray<AgentOSWorkspaceControlCenterLabels["tabs"][number]["id"]> = ["overview", "solutions", "applications", "access", "infrastructure", "operations"]
        for (const pageState of pageStates) {
            const html = renderToStaticMarkup(<AgentOSWorkspaceControlCenterBase
                pageState={pageState} controlCenterState="ready" data={pureSectionData} labels={pureSectionLabels} launchState="idle" openClawLaunchHref="#"
                onSelectPageState={vi.fn()} onOpenAgentConsole={vi.fn()} formatDate={(value) => value}
            />)
            expect(html).toContain("Agent workspace")
            if (pageState === "overview") {
                expect(html).toContain("summary")
                expect(html).toContain("runtime")
            }
        }
        const refused = renderToStaticMarkup(<AgentOSWorkspaceControlCenterBase
            pageState="overview" controlCenterState="refused" message="Unavailable" labels={pureSectionLabels} launchState="idle" openClawLaunchHref="#"
            onSelectPageState={vi.fn()} onOpenAgentConsole={vi.fn()} formatDate={(value) => value}
        />)
        expect(refused).toContain("Unavailable")
        expect(refused).not.toContain("Return to workspace list")
        expect(refused).not.toContain("Retry reading solutions")
    })

    it("reports the next selected workspace section", async () => {
        const select = vi.fn()
        const user = userEvent.setup()
        render(<AgentOSWorkspaceControlCenterBase
            pageState="overview" controlCenterState="ready" data={pureSectionData} labels={pureSectionLabels} launchState="idle" openClawLaunchHref="#"
            onSelectPageState={select} onOpenAgentConsole={vi.fn()} formatDate={(value) => value}
        />)

        await user.click(screen.getByRole("tab", { name: "applications" }))

        expect(select).toHaveBeenCalledWith("applications")
    })
})

describe("AgentOSWorkspaceControlCenterBase", () => {
    it("renders the workspace loading projection without requiring workspace data", () => {
        const labels = {
            titleFallback: "Workspace",
            loading: "Loading workspace",
            accessUnavailable: "Access unavailable",
            tabsLabel: "Sections",
            tabs: [],
            summary: {} as AgentOSWorkspaceControlCenterLabels["summary"],
            applications: {} as AgentOSWorkspaceControlCenterLabels["applications"],
            runtime: {} as AgentOSWorkspaceControlCenterLabels["runtime"],
            stack: {} as AgentOSWorkspaceControlCenterLabels["stack"],
            operations: {} as AgentOSWorkspaceControlCenterLabels["operations"],
        } satisfies AgentOSWorkspaceControlCenterLabels
        render(<AgentOSWorkspaceControlCenterBase
            pageState="overview"
            controlCenterState="loading"
            labels={labels}
            launchState="idle"
            openClawLaunchHref="#"
            onSelectPageState={vi.fn()}
            onOpenAgentConsole={vi.fn()}
            formatDate={(value) => value}
        />)
        expect(screen.getByRole("status")).toHaveTextContent("Loading workspace")
    })
})