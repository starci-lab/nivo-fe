import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspaceListBase } from "./component"

const summary = {
    overview: "AgentOS team status",
    workspaces: "Workspaces", workspacesCaption: "Owned by this account",
    running: "Running", runningCaption: "Ready now",
    attention: "Needs attention", attentionCaption: "Requires action",
    attentionGroup: "Needs your attention", steadyGroup: "Running and starting up",
    manage: "Manage workspace", retry: "Try again",
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
        expect(screen.getByText("Ready now")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Manage workspace" })).toHaveAttribute("href", "/agentos/workspaces/workspace-1")
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
        const retry = vi.fn()
        const { container, rerender } = render(<AgentOSWorkspaceListBase state="refused" props={{ label: "Workspaces", summary, message: "Unavailable" }} on={{ retry }} />)
        expect(screen.getByText("Unavailable")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledOnce()
        rerender(<AgentOSWorkspaceListBase state="resting" props={{ label: "Workspaces", summary }} />)
        expect(container.firstElementChild).toHaveAttribute("aria-busy", "true")
        expect(container.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(0)
    })

    it("prioritizes workspaces requiring an owner decision", () => {
        const { container } = render(<AgentOSWorkspaceListBase
            state="answered"
            props={{ label: "Workspaces", summary, rows: [
                { id: "healthy", href: "/healthy", name: "Healthy", detail: "Order 1", kindLabel: "Workspace", status: "ready", statusLabel: "Ready" },
                { id: "failed", href: "/failed", name: "Failed", detail: "Order 2", kindLabel: "Workspace", status: "failed", statusLabel: "Failed" },
            ] }}
            on={{ openWorkspace: vi.fn() }}
        />)
        expect(container.textContent?.indexOf("Failed")).toBeLessThan(container.textContent?.indexOf("Healthy") ?? 0)
        expect(screen.getByText("2")).toBeInTheDocument()
        expect(screen.getByText("Requires action")).toBeInTheDocument()
    })
})
