import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type WorkspacePageProbeProps = { readonly workspaceId: string, readonly pageState: string, readonly onSelectPageState: (state: "infrastructure") => void }

vi.mock("./component", () => ({
    AgentOSWorkspacePageBase: ({ workspaceId, pageState, onSelectPageState }: WorkspacePageProbeProps) => (
        <button type="button" onClick={() => onSelectPageState("infrastructure")}>{workspaceId}:{pageState}</button>
    ),
}))

import { AgentOSWorkspacePage } from "."

describe("AgentOSWorkspacePage", () => {
    it("owns the tab composition for one persisted workspace", () => {
        render(<AgentOSWorkspacePage workspaceId="workspace-1" />)
        fireEvent.click(screen.getByRole("button", { name: "workspace-1:overview" }))
        expect(screen.getByRole("button", { name: "workspace-1:infrastructure" })).toBeInTheDocument()
    })
})
