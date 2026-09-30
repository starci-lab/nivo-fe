import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

interface MockMessageScopeProps {
    readonly scope: string
    readonly children: React.ReactNode
}
vi.mock("@/features/layouts/MessageScope", () => ({
    MessageScope: ({ scope, children }: MockMessageScopeProps) => (
        <div data-testid="message-scope" data-scope={scope}>
            {children}
        </div>
    ),
}))

import AgentOSRouteLayout from "./layout"

describe("AgentOS route layout", () => {
    it("carries the AgentOS slice of the catalogue for its routes", () => {
        render(
            <AgentOSRouteLayout>
                <span>page</span>
            </AgentOSRouteLayout>,
        )
        expect(screen.getByTestId("message-scope")).toHaveAttribute("data-scope", "agentos")
        expect(screen.getByTestId("message-scope")).toContainElement(screen.getByText("page"))
    })
})
