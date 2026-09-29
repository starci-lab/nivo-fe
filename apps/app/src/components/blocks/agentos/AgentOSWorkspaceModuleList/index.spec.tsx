import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspaceModuleList } from "./index"

type ModuleListProbeProps = { readonly workspaceId: string }

vi.mock("@/components/blocks/agentos/AgentOSSolutionModuleCenter", () => ({
    AgentOSSolutionModuleCenter: ({ workspaceId }: ModuleListProbeProps) => (
        <output>{workspaceId}</output>
    ),
}))

describe("AgentOSWorkspaceModuleList", () => {
    it("keeps the module list scoped to the selected workspace", () => {
        render(<AgentOSWorkspaceModuleList workspaceId="workspace-1" />)

        expect(screen.getByText("workspace-1")).toBeInTheDocument()
    })
})
