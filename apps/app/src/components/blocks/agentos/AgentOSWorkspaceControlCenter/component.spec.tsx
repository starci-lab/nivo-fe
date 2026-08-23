import { fireEvent, render, screen } from "@testing-library/react"
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

describe("AgentOSWorkspaceControlCenterBase", () => {
    it("renders unsettled lifecycle notices", () => {
        const retry = vi.fn()
        const { rerender } = render(<AgentOSWorkspaceControlCenterBase workspaceId="workspace-1" pageState="overview" controlCenterState="loading" labels={labels} onSelectPageState={vi.fn()} onOpenAgentConsole={vi.fn()} onRetry={retry} openClawLaunchHref="#" launchState="idle" formatDate={(value) => value} />)
        expect(screen.getByText("Loading")).toBeInTheDocument()
        rerender(<AgentOSWorkspaceControlCenterBase workspaceId="workspace-1" pageState="overview" controlCenterState="refused" message="Refused" labels={labels} onSelectPageState={vi.fn()} onOpenAgentConsole={vi.fn()} onRetry={retry} openClawLaunchHref="#" launchState="idle" formatDate={(value) => value} />)
        expect(screen.getByText("Refused")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("renders and selects the infrastructure composition", () => {
        const select = vi.fn()
        render(<AgentOSWorkspaceControlCenterBase workspaceId="workspace-1" pageState="infrastructure" controlCenterState="ready" data={data} labels={labels} onSelectPageState={select} onOpenAgentConsole={vi.fn()} onRetry={vi.fn()} openClawLaunchHref="#" launchState="idle" formatDate={(value) => value} />)
        expect(screen.getByText("runtime")).toBeInTheDocument()
        expect(screen.getByText("helm stack")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("radio", { name: "operations" }))
        expect(select).toHaveBeenCalledWith("operations")
    })
})
