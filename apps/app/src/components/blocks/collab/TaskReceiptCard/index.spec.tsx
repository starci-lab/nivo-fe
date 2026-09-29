import { TaskReceiptCard } from "./index"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { buildConversationItems } from "@/modules/collab/group-chat/model"
import {
    OWNER,
    PARTICIPANTS,
    MESSAGE,
    BINDING,
    labels,
    baseView,
    REPORTED_BINDING,
    REFUSED_BINDING,
    WORKING_TASK,
    messageAt,
    conversationItemsOfKind,
} from "@/modules/collab/group-chat/test-fixtures.fixture"

describe("TaskReceiptCard", () => {
    it("renders task receipts for pending, reported and refused cards", () => {
        const items = buildConversationItems({
            messages: [MESSAGE, messageAt("msg-3"), messageAt("msg-4")],
            cards: [BINDING, REPORTED_BINDING, REFUSED_BINDING],
            tasks: [WORKING_TASK],
            participants: PARTICIPANTS,
            viewerMemberId: OWNER.memberId,
            unknownAuthor: labels.conversation.unknownAuthor,
        })
        render(
            <>
                {conversationItemsOfKind(baseView({ items }), "task-card").map((item) => (
                    <TaskReceiptCard key={item.binding.bindingId} item={item} labels={labels} />
                ))}
            </>,
        )
        expect(screen.getByText(labels.card.receiptPending)).toBeInTheDocument()
        expect(screen.getByText(labels.card.receiptReported)).toBeInTheDocument()
        expect(screen.getByText(labels.card.receiptRefused)).toBeInTheDocument()
        expect(screen.getByText(labels.statuses.working)).toBeInTheDocument()
        expect(screen.getAllByText("build-sales-report")).toHaveLength(2)
        expect(document.getElementById("collab-task-task-w")).not.toBeNull()
    })
})
