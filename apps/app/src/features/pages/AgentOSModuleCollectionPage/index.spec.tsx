import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSModuleCollectionPage", () => ({
    AgentOSModuleCollectionPage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AgentOSModuleCollectionPage } from "."

describe("AgentOSModuleCollectionPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AgentOSModuleCollectionPage workspaceId="workspace-1" />)
        expect(screen.getByTestId("block")).toHaveTextContent("workspace-1")
    })
})