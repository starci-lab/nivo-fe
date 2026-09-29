import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { InviteForm } from "./index"
import { labels, baseView, actions } from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("InviteForm", () => {
    it("submits the selected role through the invitation form", () => {
        const on = actions()
        render(
            <InviteForm
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
        const roleGroup = screen.getByRole("radiogroup", { name: labels.invite.role })
        expect(email).toBeInTheDocument()
        expect(roleGroup).toBeInTheDocument()
        expect(screen.getByRole("radio", { name: labels.roles.owner })).toBeInTheDocument()
        expect(screen.getByRole("radio", { name: labels.roles.manager })).toBeInTheDocument()
        expect(screen.getByRole("radio", { name: labels.roles.staff })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: labels.invite.submit })).toBeInTheDocument()
        fireEvent.change(email, { target: { value: "mai@congty.vn" } })
        fireEvent.click(screen.getByRole("radio", { name: labels.roles.staff }))
        expect(on.changeInviteRole).toHaveBeenCalledWith("staff")
        const form = email.closest("form")
        if (form === null) throw new Error("Invitation form is missing")
        fireEvent.submit(form)
        expect(on.submitInvite).toHaveBeenCalledTimes(1)
    })

    it("shows invite outcomes without disclosing beyond the authorized answer", () => {
        render(
            <InviteForm
                view={baseView({
                    invite: {
                        email: "",
                        role: "staff",
                        pending: false,
                        outcome: "created",
                        invitedEmail: "mai@congty.vn",
                    },
                })}
                labels={labels}
                on={actions()}
            />,
        )
        expect(screen.getByText("Đã ghi nhận lời mời tới mai@congty.vn.")).toBeInTheDocument()
    })

    it("reports existing and refused invitations", () => {
        const { rerender } = render(
            <InviteForm
                view={baseView({
                    invite: { email: "a@b.vn", role: "staff", pending: false, outcome: "existing", invitedEmail: null },
                })}
                labels={labels}
                on={actions()}
            />,
        )
        expect(screen.getByText(labels.invite.existing)).toBeInTheDocument()
        rerender(
            <InviteForm
                view={baseView({
                    invite: { email: "", role: "staff", pending: false, outcome: "refused", invitedEmail: null },
                })}
                labels={labels}
                on={actions()}
            />,
        )
        expect(screen.getByText(labels.invite.refused)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: labels.invite.submit })).toBeDisabled()
    })
})
