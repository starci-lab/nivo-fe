import { expectNoA11yViolations } from "@/testing/axe"
import { NoticesBand } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { CollabTurnNoticeItem } from "../../../../modules/api/collab"
import { NOTICE, labels, baseView, actions } from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("NoticesBand", () => {
    it("lists outstanding notices and follows one to its card", async () => {
        const on = actions()
        const { container } = render(<NoticesBand view={baseView({ notices: [NOTICE] })} labels={labels} on={on} />)
        fireEvent.click(screen.getByRole("button", { name: "Mở" }))
        expect(on.openNotice).toHaveBeenCalledWith("ntc-1")
        await expectNoA11yViolations(container)
    })
    it("marks a handled notice without offering a stale action", () => {
        const on = actions()
        render(
            <NoticesBand
                view={baseView({ notices: [NOTICE], noticeOutcomes: { "ntc-1": "handled" } })}
                labels={labels}
                on={on}
            />,
        )
        expect(screen.getByText("Đã xử lý")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Mở" })).toBeNull()
    })
    it("shows notice outcomes for unavailable and ended turns and opens a task assignment", () => {
        const on = actions()
        const assign: CollabTurnNoticeItem = {
            ...NOTICE,
            notice: { ...NOTICE.notice, noticeId: "ntc-2", turnKind: "task-assign" },
        }
        const ended: CollabTurnNoticeItem = { ...NOTICE, notice: { ...NOTICE.notice, noticeId: "ntc-3" } }
        render(
            <NoticesBand
                view={baseView({
                    notices: [NOTICE, assign, ended],
                    noticeOutcomes: { "ntc-1": "unavailable", "ntc-3": "ended" },
                })}
                labels={labels}
                on={on}
            />,
        )
        expect(screen.getByText(labels.notice.unavailable)).toBeInTheDocument()
        expect(screen.getByText(labels.notice.handled)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: labels.notice.open }))
        expect(on.openNotice).toHaveBeenCalledWith("ntc-2")
    })
})
