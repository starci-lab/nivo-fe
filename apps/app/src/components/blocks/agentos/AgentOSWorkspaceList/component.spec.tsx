import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspaceListBase } from "./component"

const summary = {
    workspaces: "Workspaces", workspacesCaption: "Owned by this account",
    running: "Running", runningCaption: "Ready now",
    attention: "Needs attention", attentionCaption: "Requires action",
}

describe("AgentOSWorkspaceListBase", () => {
    it("renders one management row and opens its persisted workspace", () => {
        const openWorkspace = vi.fn()
        render(<AgentOSWorkspaceListBase
            state="answered"
            props={{ label: "Workspaces", summary, rows: [{ id: "workspace-1", href: "/agentos/workspaces/workspace-1", name: "Support", detail: "order-1", kindLabel: "Workspace", status: "ready", statusLabel: "Ready" }] }}
            on={{ openWorkspace }}
        />)
        fireEvent.click(screen.getByRole("link", { name: "Support" }))
        expect(openWorkspace).toHaveBeenCalledWith("workspace-1")
    })

    it("keeps the empty continuation inside one notice", () => {
        const create = vi.fn()
        render(<AgentOSWorkspaceListBase
            state="empty"
            props={{ label: "Workspaces", summary, message: "No workspaces", actionLabel: "Create" }}
            on={{ create }}
        />)
        expect(screen.getAllByRole("button", { name: "Create" })).toHaveLength(1)
        fireEvent.click(screen.getByRole("button", { name: "Create" }))
        expect(create).toHaveBeenCalledOnce()
    })

    it("renders refusal and resting states", () => {
        const { rerender } = render(<AgentOSWorkspaceListBase state="refused" props={{ label: "Workspaces", summary, message: "Unavailable" }} />)
        expect(screen.getByText("Unavailable")).toBeInTheDocument()
        rerender(<AgentOSWorkspaceListBase state="resting" props={{ label: "Workspaces", summary }} />)
        expect(screen.getAllByText("Workspaces").length).toBeGreaterThan(0)
    })
})
