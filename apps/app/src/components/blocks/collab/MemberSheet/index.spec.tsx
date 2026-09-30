import { expectNoA11yViolations } from "@/testing/axe"
import { MemberSheet } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { STAFF, PARTICIPANTS, labels, baseView, actions } from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("MemberSheet", () => {
    it("renders and closes the compact member sheet", async () => {
        const on = actions()
        const { container } = render(<MemberSheet view={baseView()} labels={labels} on={on} showInvite={false} />)
        expect(screen.getByRole("button", { name: labels.members.closeRail })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: labels.members.closeRail }))
        expect(on.changeRailOpen).toHaveBeenCalledWith(false)
        await expectNoA11yViolations(container)
    })
    it("renders the Staff roster in the compact member sheet", () => {
        const on = actions()
        const humansOnly = PARTICIPANTS.filter((participant) => participant.kind === "human")
        const { rerender } = render(
            <MemberSheet
                view={baseView({ viewer: STAFF, participants: humansOnly })}
                labels={labels}
                on={on}
                showInvite={false}
            />,
        )
        expect(screen.getByRole("region", { name: labels.members.title })).toBeInTheDocument()
        expect(screen.getByText(labels.members.noModules)).toBeInTheDocument()
        rerender(
            <MemberSheet
                view={baseView({ viewer: STAFF, participants: [], workspaceName: null })}
                labels={labels}
                on={on}
                showInvite={false}
            />,
        )
        expect(screen.getByText(labels.members.empty)).toBeInTheDocument()
    })
})
