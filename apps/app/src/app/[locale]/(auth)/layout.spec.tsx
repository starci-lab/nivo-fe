import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

interface MockMessageScopeProps { readonly scope: string; readonly children: React.ReactNode }
vi.mock("@/features/layouts/MessageScope", () => ({ MessageScope: ({ scope, children }: MockMessageScopeProps) => <div data-testid="message-scope" data-scope={scope}>{children}</div> }))

import AuthRouteLayout from "./layout"

describe("authentication route layout", () => {
    it("ships only the sign-in copy around the door", () => {
        render(<AuthRouteLayout><span>sign in</span></AuthRouteLayout>)
        expect(screen.getByTestId("message-scope")).toHaveAttribute("data-scope", "authentication")
        expect(screen.getByTestId("message-scope")).toContainElement(screen.getByText("sign in"))
    })
})
