import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceChrome", () => ({
    AgentOSWorkspaceChrome: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AgentOSWorkspaceChrome } from "."

describe("AgentOSWorkspaceChrome server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AgentOSWorkspaceChrome><span>route content</span></AgentOSWorkspaceChrome>)
        expect(screen.getByTestId("block")).toHaveTextContent("route content")
    })
})