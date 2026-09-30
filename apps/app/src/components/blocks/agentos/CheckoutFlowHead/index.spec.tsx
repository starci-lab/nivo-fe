import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { CheckoutFlowHead } from "./index"

describe("CheckoutFlowHead", () => {
    it("links prior steps and marks the active breadcrumb", async () => {
        const { container } = render(
            <CheckoutFlowHead
                accessibilityLabel="Checkout path"
                breadcrumbs={[
                    { label: "Workspaces", href: "/agentos/workspaces" },
                    { label: "New workspace", href: "/agentos/workspaces/new" },
                    { label: "Checkout", isCurrent: true },
                ]}
                title="Review workspace purchase"
                description="Confirm the selected offer."
            />,
        )

        expect(screen.getByRole("navigation", { name: "Checkout path" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Workspaces" })).toHaveAttribute("href", "/agentos/workspaces")
        expect(screen.getByRole("link", { name: "New workspace" })).toHaveAttribute("href", "/agentos/workspaces/new")
        expect(screen.getByText("Checkout").closest("li")).toHaveAttribute("aria-current", "page")
        await expectNoA11yViolations(container)
    })
})
