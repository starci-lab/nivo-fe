import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSModuleCreatePage", () => ({
    AgentOSModuleCreatePage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AgentOSModuleCreatePage } from "."

describe("AgentOSModuleCreatePage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AgentOSModuleCreatePage workspaceId="workspace-1" />)
        expect(screen.getByTestId("block")).toHaveTextContent("workspace-1")
    })
})