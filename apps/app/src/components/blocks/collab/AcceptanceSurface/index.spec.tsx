import { expectNoA11yViolations } from "@/testing/axe"
import { AcceptanceSurface } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { labels, baseView, actions } from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("AcceptanceSurface", () => {
    it("renders the invitation acceptance surface without Office content", async () => {
        const on = actions()
        const view = baseView({
            screen: "acceptance",
            acceptance: { state: "ready", roleHint: "staff", invalidLink: false },
        })
        const { container } = render(<AcceptanceSurface view={view} labels={labels} on={on} />)
        expect(screen.getByText("Lời mời vào workspace")).toBeInTheDocument()
        expect(screen.getByText("Vai trò được mời: Staff")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Chấp nhận lời mời" }))
        expect(on.acceptInvitation).toHaveBeenCalled()
        await expectNoA11yViolations(container)
    })
    it("shows a non-disclosing refusal for an unentitled acceptance", () => {
        const on = actions()
        render(
            <AcceptanceSurface
                view={baseView({
                    screen: "acceptance",
                    acceptance: { state: "refused", roleHint: null, invalidLink: false },
                })}
                labels={labels}
                on={on}
            />,
        )
        expect(screen.getByText("Lời mời không còn hiệu lực hoặc email đăng nhập chưa khớp.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Chấp nhận lời mời" })).toBeDisabled()
    })
    it("keeps a pending acceptance without a role hint", () => {
        render(
            <AcceptanceSurface
                view={baseView({
                    screen: "acceptance",
                    acceptance: { state: "pending", roleHint: null, invalidLink: false },
                })}
                labels={labels}
                on={actions()}
            />,
        )
        expect(screen.getByText(labels.accept.body)).toBeInTheDocument()
        expect(screen.queryByText(/Vai trò được mời/u)).toBeNull()
    })
    it("renders nothing for an acceptance screen without an acceptance view", () => {
        render(
            <AcceptanceSurface
                view={baseView({ screen: "acceptance", acceptance: null })}
                labels={labels}
                on={actions()}
            />,
        )
        expect(screen.queryByRole("button", { name: labels.accept.action })).toBeNull()
    })
})
