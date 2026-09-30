import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildConversationItems } from "../../../../modules/collab/group-chat/model"
import { MessageEntry } from "./index"
import { MESSAGE, OWNER, PARTICIPANTS, labels } from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("MessageEntry", () => {
    it("renders a message author, addressed module and body", async () => {
        const item = buildConversationItems({
            messages: [MESSAGE],
            cards: [],
            tasks: [],
            participants: PARTICIPANTS,
            viewerMemberId: OWNER.memberId,
            unknownAuthor: labels.conversation.unknownAuthor,
        }).find((entry) => entry.kind === "message")
        if (item?.kind !== "message") {
            throw new Error("Message entry was not built")
        }
        const { container } = render(<MessageEntry item={item} labels={labels} decision={false} />)
        expect(screen.getByText("An Nguyen")).toBeInTheDocument()
        expect(screen.getByText("@sales")).toBeInTheDocument()
        expect(screen.getByText("Can you send me this month's sales report?")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
