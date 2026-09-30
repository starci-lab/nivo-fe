import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSModuleStudioPage", () => ({
    AgentOSModuleStudioPage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AgentOSModuleStudioPage } from "."

describe("AgentOSModuleStudioPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AgentOSModuleStudioPage workspaceId="workspace-1" moduleId="module-1" />)
        expect(screen.getByTestId("block")).toHaveTextContent("module-1")
    })
})