import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSOpenClawLaunchBase, type AgentOSOpenClawLaunchViewProps } from "./component"

const props: Omit<AgentOSOpenClawLaunchViewProps, "launchState"> = {
    workspaceId: "workspace-1",
    labels: {
        title: "OpenClaw launch",
        workspaceLabel: "Workspace",
        securityNote: "Short-lived secure bridge",
        returnToWorkspace: "Return to workspace",
        retry: "Retry",
        states: {
            issuing: { label: "Issuing", detail: "Preparing launch" },
            connected: { label: "Connected", detail: "Launch connected" },
            blocked: { label: "Blocked", detail: "Launch blocked" },
            expired: { label: "Expired", detail: "Launch expired" },
            disconnected: { label: "Disconnected", detail: "Launch disconnected" },
        },
    },
    onRetry: vi.fn(),
    onReturn: vi.fn(),
}

describe("AgentOSOpenClawLaunch drawing", () => {
    it("keeps the fixed page anatomy while the launch block is issuing", () => {
        render(<AgentOSOpenClawLaunchBase {...props} launchState="issuing" />)
        expect(screen.getByText("Issuing")).toBeInTheDocument()
        expect(screen.getByRole("status")).toHaveTextContent("Preparing launch")
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("keeps an explicitly initiated retry pending on Retry", () => {
        render(<AgentOSOpenClawLaunchBase {...props} launchState="issuing" isRetryPending />)
        expect(screen.getByRole("status")).toHaveTextContent("Preparing launch")
        expect(screen.getByRole("button", { name: "Retry" })).toHaveAttribute("data-action-pending", "true")
        expect(screen.getByRole("button", { name: "Retry" })).toBeDisabled()
    })

    it("maps connected launch state to the return action", () => {
        const html = renderToStaticMarkup(<AgentOSOpenClawLaunchBase {...props} launchState="connected" detail="Expires soon" />)
        expect(html).toContain("Return to workspace")
        expect(html).toContain("Expires soon")
        expect(html).toContain('data-tone="success"')
    })

    it("maps blocked launch state to retry without introducing a page state", () => {
        const html = renderToStaticMarkup(<AgentOSOpenClawLaunchBase {...props} launchState="blocked" />)
        expect(html).toContain("Retry")
        expect(html).toContain("Launch blocked")
        expect(html).toContain('data-tone="danger"')
    })
})
