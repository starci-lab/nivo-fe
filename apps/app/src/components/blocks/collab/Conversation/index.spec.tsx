import { expectNoA11yViolations } from "@/testing/axe"
import { Conversation } from "./index"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildConversationItems } from "../../../../modules/collab/group-chat/model"
import {
    OWNER,
    PARTICIPANTS,
    MESSAGE,
    MODULE_MESSAGE,
    labels,
    baseView,
    actions,
} from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("Conversation", () => {
    it("renders the authorized Office snapshot: roster, modules, conversation and a working composer", async () => {
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
        const { container } = render(
            <Conversation
                view={view}
                labels={labels}
                on={on}
                decision={view.items.some((item) => item.kind === "approval-card")}
            />,
        )
        expect(screen.getByText("An Nguyen")).toBeInTheDocument()
        expect(screen.getByText("Sales")).toBeInTheDocument()
        expect(screen.getByText("Can you send me this month's sales report?")).toBeInTheDocument()
        expect(screen.getByText("@sales")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
