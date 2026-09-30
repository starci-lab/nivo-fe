import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSInstallationChrome", () => ({
    AgentOSInstallationChrome: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AgentOSInstallationChrome } from "."

describe("AgentOSInstallationChrome server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AgentOSInstallationChrome><span>route content</span></AgentOSInstallationChrome>)
        expect(screen.getByTestId("block")).toHaveTextContent("route content")
    })
})