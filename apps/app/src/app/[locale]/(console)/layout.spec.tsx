import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

interface MockConsoleLayoutProps { readonly body: React.ReactNode }
vi.mock("@/components/layouts/ConsoleLayout", () => ({ ConsoleLayout: (props: MockConsoleLayoutProps) => <section data-testid="console-layout">{props.body}</section> }))

import ConsoleRouteLayout from "./layout"

describe("console route layout", () => {
    it("delegates authentication and drawing to the connected layout owner", () => {
        render(<ConsoleRouteLayout><span>workspace body</span></ConsoleRouteLayout>)
        expect(screen.getByTestId("console-layout")).toContainElement(screen.getByText("workspace body"))
    })
})
