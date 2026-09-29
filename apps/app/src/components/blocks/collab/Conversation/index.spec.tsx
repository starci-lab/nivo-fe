import { Conversation } from "./index"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildConversationItems } from "@/modules/collab/group-chat/model"
import {
    OWNER,
    PARTICIPANTS,
    MESSAGE,
    MODULE_MESSAGE,
    labels,
    baseView,
    actions,
} from "@/modules/collab/group-chat/test-fixtures.fixture"

describe("Conversation", () => {
    it("renders the authorized Office snapshot: roster, modules, conversation and a working composer", () => {
        const on = actions()
        const view = baseView({
            items: buildConversationItems({
                messages: [MESSAGE, MODULE_MESSAGE],
                cards: [],
                tasks: [],
                participants: PARTICIPANTS,
                viewerMemberId: OWNER.memberId,
                unknownAuthor: labels.conversation.unknownAuthor,
            }),
        })
        render(
            <Conversation
                view={view}
                labels={labels}
                on={on}
                decision={view.items.some((item) => item.kind === "approval-card")}
            />,
        )
        expect(screen.getByText("An Nguyen")).toBeInTheDocument()
        expect(screen.getByText("Sales")).toBeInTheDocument()
        expect(screen.getByText("Bạn có thể gửi giúp mình báo cáo doanh số tháng này không?")).toBeInTheDocument()
        expect(screen.getByText("@sales")).toBeInTheDocument()
    })
})
