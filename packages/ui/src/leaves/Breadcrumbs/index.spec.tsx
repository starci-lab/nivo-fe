import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Breadcrumbs } from "."

describe("Breadcrumbs", () => {
    it("delegates a shallow trail to HeroUI and keeps the current step inert", () => {
        const activate = vi.fn()
        render(<Breadcrumbs
            props={{
                mode: "trail",
                label: "Path",
                steps: [
                    { id: "overview", label: "Overview" },
                    { id: "agentos", label: "AgentOS", isCurrent: true },
                ],
            }}
            on={{ activate }}
        />)

        fireEvent.click(screen.getByText("Overview"))
        fireEvent.click(screen.getByText("AgentOS"))
        expect(activate).toHaveBeenCalledOnce()
        expect(activate).toHaveBeenCalledWith("overview")
        expect(screen.getByText("AgentOS").closest("[aria-current]")).toHaveAttribute("aria-current", "page")
    })

    it("renders a deep path as one quiet back link", () => {
        const back = vi.fn()
        render(<Breadcrumbs props={{ mode: "back", label: "Path", backLabel: "Back to Order 42" }} on={{ back }} />)

        fireEvent.click(screen.getByText("Back to Order 42"))
        expect(back).toHaveBeenCalledOnce()
        expect(document.querySelector("[data-mode='trail']")).not.toBeInTheDocument()
    })
})
