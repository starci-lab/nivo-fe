import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSDashboardPage", () => ({
    AgentOSDashboardPage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AgentOSPage } from "."

describe("AgentOSPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AgentOSPage mode="dashboard" />)
        expect(screen.getByTestId("block")).toHaveTextContent("dashboard")
    })
})