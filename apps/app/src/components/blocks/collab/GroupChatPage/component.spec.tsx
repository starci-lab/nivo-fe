import { fireEvent, render, screen } from "@testing-library/react"
import { matchMediaFixture } from "@/test-support/mock-result"
import { beforeAll, describe, expect, it } from "vitest"
import { GroupChatPageBase } from "./component"
import { actions, baseView, labels } from "@/modules/collab/group-chat/test-fixtures.fixture"

describe("GroupChatPageBase", () => {
    beforeAll(() => {
        window.matchMedia = matchMediaFixture(false)
    })

    it("withholds every Office fact on denial and offers a safe return", () => {
        const on = actions()
        render(
            <GroupChatPageBase
                state={{ isRailOpen: false, labels }}
                props={{ view: baseView({ officeState: "denied" }) }}
                on={on}
            />,
        )
        expect(screen.getByText("Office không khả dụng")).toBeInTheDocument()
        expect(screen.queryByRole("textbox", { name: "Tin nhắn" })).toBeNull()
        expect(screen.queryByText("An Nguyen")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Về Tổng quan" }))
        expect(on.leaveOffice).toHaveBeenCalled()
    })

    it("marks read failure as stale with an explicit retry", () => {
        const on = actions()
        render(
            <GroupChatPageBase
                state={{ isRailOpen: false, labels }}
                props={{ view: baseView({ officeState: "failed" }) }}
                on={on}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Thử lại" }))
        expect(on.retryOffice).toHaveBeenCalled()
    })

    it("shows the loading state inside the workbench", () => {
        render(
            <GroupChatPageBase
                state={{ isRailOpen: false, labels }}
                props={{ view: baseView({ officeState: "loading" }) }}
                on={actions()}
            />,
        )
        expect(screen.getByText("Đang tải Office…")).toBeInTheDocument()
    })
})
