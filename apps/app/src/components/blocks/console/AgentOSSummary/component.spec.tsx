import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSSummaryBase, type AgentOSSummaryState, type AgentOSSummaryWorkspace } from "./component"

const workspace: AgentOSSummaryWorkspace = {
    id: "workspace-1",
    name: "Support",
    description: "OpenClaw workspace",
    statusLabel: "Available",
    statusTone: "success",
    actionLabel: "Open service",
    detail: "Pod is answering",
}

describe("AgentOSSummaryBase", () => {
    it("draws the workspace, its runtime detail and its one safe service action", () => {
        const onOpenService = vi.fn()
        render(<AgentOSSummaryBase label="AgentOS" state={{ phase: "populated", workspace }} onOpenService={onOpenService} />)

        expect(screen.getByText("Support")).toBeInTheDocument()
        expect(screen.getByText("OpenClaw workspace")).toBeInTheDocument()
        expect(screen.getByText("Available")).toBeInTheDocument()
        expect(screen.getByText("Pod is answering")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Open service" }))
        expect(onOpenService).toHaveBeenCalledWith("workspace-1")
    })

    it("follows a workspace link when the caller supplied an address", () => {
        const onOpenService = vi.fn()
        render(<AgentOSSummaryBase
            label="AgentOS"
            state={{ phase: "populated", workspace: { ...workspace, actionHref: "/agentos/workspaces/workspace-1" } }}
            onOpenService={onOpenService}
        />)

        expect(screen.getByRole("link", { name: "Open service" })).toHaveAttribute("href", "/agentos/workspaces/workspace-1")
    })

    it("draws a settled missing workspace as a notice, not an empty row", () => {
        render(<AgentOSSummaryBase label="AgentOS" state={{ phase: "empty", message: "No workspace" }} onOpenService={vi.fn()} />)

        expect(screen.getByText("No workspace")).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("renders every settled state without inventing a workspace", () => {
        const states: ReadonlyArray<AgentOSSummaryState> = [
            { phase: "pending" },
            { phase: "empty", message: "No workspace" },
            { phase: "populated", workspace },
            { phase: "partial", workspace },
            { phase: "forbidden", workspace },
        ]

        for (const state of states) {
            const view = render(<AgentOSSummaryBase label="AgentOS" state={state} onOpenService={vi.fn()} />)
            expect(screen.getAllByText("AgentOS").length).toBeGreaterThan(0)
            view.unmount()
        }
    })
})
