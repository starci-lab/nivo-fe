import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

interface MockConsoleLayoutProps {
    readonly children: React.ReactNode
}
interface MockMessageScopeProps {
    readonly scope: string
    readonly children: React.ReactNode
}
vi.mock("@/features/layouts/ConsoleLayout", () => ({
    ConsoleLayout: ({ children }: MockConsoleLayoutProps) => <section data-testid="console-layout">{children}</section>,
}))
vi.mock("@/features/layouts/MessageScope", () => ({
    MessageScope: ({ scope, children }: MockMessageScopeProps) => (
        <div data-testid="message-scope" data-scope={scope}>
            {children}
        </div>
    ),
}))

import ConsoleRouteLayout from "./layout"

describe("console route layout", () => {
    it("delegates authentication and drawing to the connected layout owner", () => {
        render(
            <ConsoleRouteLayout>
                <span>workspace body</span>
            </ConsoleRouteLayout>,
        )
        expect(screen.getByTestId("console-layout")).toContainElement(screen.getByText("workspace body"))
    })

    it("ships the console copy around the frame", () => {
        render(
            <ConsoleRouteLayout>
                <span>workspace body</span>
            </ConsoleRouteLayout>,
        )
        expect(screen.getByTestId("message-scope")).toHaveAttribute("data-scope", "console")
        expect(screen.getByTestId("message-scope")).toContainElement(screen.getByTestId("console-layout"))
    })
})
