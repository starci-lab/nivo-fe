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

import LaunchRouteLayout from "./layout"

describe("launch route layout", () => {
    it("carries the console copy the launch bridges open surfaces for", () => {
        render(
            <LaunchRouteLayout>
                <span>bridge</span>
            </LaunchRouteLayout>,
        )
        expect(screen.getByTestId("message-scope")).toHaveAttribute("data-scope", "console")
        expect(screen.getByTestId("message-scope")).toContainElement(screen.getByText("bridge"))
    })
})
