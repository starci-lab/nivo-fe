import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type WorkspacePageProbeProps = { readonly workspaceId: string, readonly pageState: string, readonly onSelectPageState: (state: "infrastructure") => void }

vi.mock("./component", () => ({
    AgentOSWorkspacePageBase: ({ workspaceId, pageState, onSelectPageState }: WorkspacePageProbeProps) => (
        <button type="button" onClick={() => onSelectPageState("infrastructure")}>{workspaceId}:{pageState}</button>
    ),
}))

const navigation = vi.hoisted(() => ({ push: vi.fn(), view: "" }))
vi.mock("next/navigation", () => ({
    useSearchParams: () => new URLSearchParams(navigation.view),
}))
vi.mock("@/i18n/navigation", () => ({
    usePathname: () => "/agentos/workspaces/workspace-1",
    useRouter: () => ({ push: navigation.push }),
}))

import { AgentOSWorkspacePage } from "."

describe("AgentOSWorkspacePage", () => {
    it("owns the tab composition for one persisted workspace", () => {
        render(<AgentOSWorkspacePage workspaceId="workspace-1" />)
        fireEvent.click(screen.getByRole("button", { name: "workspace-1:overview" }))
        expect(navigation.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-1?view=infrastructure")
    })

    it("restores the addressable AI and Knowledge view from the URL", () => {
        navigation.view = "view=ai-knowledge"
        render(<AgentOSWorkspacePage workspaceId="workspace-1" />)
        expect(screen.getByRole("button", { name: "workspace-1:ai-knowledge" })).toBeInTheDocument()
    })
})