import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSModuleRoutePage", () => ({
    AgentOSModuleRoutePage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AgentOSSolutionModulePage } from "."

describe("AgentOSSolutionModulePage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AgentOSSolutionModulePage workspaceId="workspace-1" installationId="install-1" view="settings" />)
        expect(screen.getByTestId("block")).toHaveTextContent("settings")
    })
})