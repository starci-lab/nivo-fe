import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { WorkbenchRail } from "."

describe("WorkbenchRail", () => {
    it("keeps the shared scope and notice cards around caller-owned rail cards", () => {
        const { container } = render(
            <WorkbenchRail
                props={{
                    className: "rail-stack",
                    scopeLabel: "Scope",
                    scope: <span>Resolved scope</span>,
                    beforeNotice: <span>Current attention</span>,
                    noticeLabel: "Last command",
                    noticeEmpty: "No command yet",
                    notice: <span>Command settled</span>,
                    afterNotice: <span>Installation readiness</span>,
                }}
            />,
        )

        expect(container.firstChild).toHaveClass("rail-stack")
        expect(screen.getByText("Resolved scope")).toBeInTheDocument()
        expect(screen.getByText("Current attention")).toBeInTheDocument()
        expect(screen.getByText("Command settled")).toBeInTheDocument()
        expect(screen.getByText("Installation readiness")).toBeInTheDocument()
    })

    it("draws the empty notice copy when a command has no result", () => {
        render(
            <WorkbenchRail
                props={{
                    className: "rail-stack",
                    scopeLabel: "Scope",
                    scope: <span>Resolved scope</span>,
                    noticeLabel: "Last command",
                    noticeEmpty: "No command yet",
                    notice: null,
                }}
            />,
        )

        expect(screen.getByText("No command yet")).toBeInTheDocument()
    })
})
