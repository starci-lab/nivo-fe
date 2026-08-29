import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type WorkspaceControlProbeProps = { readonly workspaceId: string, readonly pageState: string, readonly onSelectPageState: (state: "infrastructure") => void }

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceControlCenter", () => ({
    AgentOSWorkspaceControlCenter: ({ workspaceId, pageState, onSelectPageState }: WorkspaceControlProbeProps) => (
        <button type="button" onClick={() => onSelectPageState("infrastructure")}>{workspaceId}:{pageState}</button>
    ),
}))

import { AgentOSWorkspacePageBase } from "./component"

describe("AgentOSWorkspacePageBase", () => {
    it("passes only route identity and the page-owned tab axis", () => {
        const select = vi.fn()
        render(<AgentOSWorkspacePageBase workspaceId="workspace-1" pageState="overview" onSelectPageState={select} />)
        fireEvent.click(screen.getByRole("button", { name: "workspace-1:overview" }))
        expect(select).toHaveBeenCalledWith("infrastructure")
    })
})