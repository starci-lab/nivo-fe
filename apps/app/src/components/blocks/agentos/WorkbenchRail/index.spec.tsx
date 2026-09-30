import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { WorkbenchRail } from "."

describe("WorkbenchRail", () => {
    it("keeps the shared scope and notice cards around caller-owned rail cards", async () => {
        const { container } = render(
            <WorkbenchRail
                props={{
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

        expect(screen.getByText("Resolved scope")).toBeInTheDocument()
        expect(screen.getByText("Current attention")).toBeInTheDocument()
        expect(screen.getByText("Command settled")).toBeInTheDocument()
        expect(screen.getByText("Installation readiness")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })

    it("draws the empty notice copy when a command has no result", () => {
        render(
            <WorkbenchRail
                props={{
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
