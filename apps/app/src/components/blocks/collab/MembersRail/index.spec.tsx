import { expectNoA11yViolations } from "@/testing/axe"
import { MembersRail } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { CollabOfficeParticipant } from "../../../../modules/api/collab"
import { PARTICIPANTS, STAFF, labels, baseView, actions } from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("MembersRail", () => {
    it("says plainly when no module is hired while human chat stays usable", async () => {
        const on = actions()
        const { container } = render(
            <MembersRail
                view={baseView({ participants: PARTICIPANTS.filter((p) => p.kind === "human") })}
                labels={labels}
                on={on}
            />,
        )
        expect(screen.getByText("Chưa có module nào được thuê.")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
    it("presents empty rosters and a pending invitee on the rail", () => {
        const invited: CollabOfficeParticipant = {
            ...PARTICIPANTS[2]!,
            memberId: "mem-new",
            displayName: "Lan",
            status: "invited",
        }
        const { rerender } = render(
            <MembersRail view={baseView({ participants: [] })} labels={labels} on={actions()} />,
        )
        expect(screen.getByText(labels.members.empty)).toBeInTheDocument()
        rerender(<MembersRail view={baseView({ participants: [invited] })} labels={labels} on={actions()} />)
        expect(screen.getByText(labels.members.pending)).toBeInTheDocument()
    })

    it("focuses the invite email from the rail and submits the selected role", () => {
        const on = actions()
        render(
            <MembersRail
                view={baseView({
                    invite: {
                        email: "mai@congty.vn",
                        role: "manager",
                        pending: false,
                        outcome: null,
                        invitedEmail: null,
                    },
                })}
                labels={labels}
                on={on}
            />,
        )
        const email = screen.getByRole("textbox", { name: labels.invite.email })
        fireEvent.click(screen.getByRole("button", { name: labels.invite.title }))
        expect(email).toHaveFocus()
        const form = email.closest("form")
        if (form === null) throw new Error("Invitation form is missing")
        fireEvent.submit(form)
        expect(on.submitInvite).toHaveBeenCalledTimes(1)
    })

    it("gates the invite form on the server-derived viewer role", () => {
        const on = actions()
        const { rerender } = render(<MembersRail view={baseView()} labels={labels} on={on} />)
        const email = screen.getByRole("textbox", { name: labels.invite.email })
        fireEvent.change(email, { target: { value: "mai@congty.vn" } })
        expect(on.changeInviteEmail).toHaveBeenCalledWith("mai@congty.vn")
        fireEvent.click(screen.getByRole("radio", { name: labels.roles.manager }))
        expect(on.changeInviteRole).toHaveBeenCalledWith("manager")
        rerender(<MembersRail view={baseView({ viewer: STAFF })} labels={labels} on={on} />)
        expect(screen.queryByRole("textbox", { name: labels.invite.email })).toBeNull()
        expect(screen.queryByRole("button", { name: labels.invite.submit })).toBeNull()
    })
})
