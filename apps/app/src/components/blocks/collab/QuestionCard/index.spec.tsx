import { QuestionCard } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { CollabOfficeViewer } from "@/modules/api/collab"
import { buildConversationItems } from "@/modules/collab/group-chat/model"
import {
    OWNER,
    PARTICIPANTS,
    MESSAGE,
    QUESTION,
    TASK_WAITING_ANSWER,
    labels,
    baseView,
    actions,
    conversationItemsOfKind,
} from "@/modules/collab/group-chat/test-fixtures.fixture"

describe("QuestionCard", () => {
    it("shows a waiting question with the assignee's answer affordance only", () => {
        const on = actions()
        const items = buildConversationItems({
            messages: [MESSAGE],
            cards: [],
            tasks: [TASK_WAITING_ANSWER],
            participants: PARTICIPANTS,
            viewerMemberId: OWNER.memberId,
            unknownAuthor: labels.conversation.unknownAuthor,
        })
        const { rerender } = render(
            <>
                {conversationItemsOfKind(baseView({ items }), "question-card").map((item) => (
                    <QuestionCard
                        key={item.question.questionId}
                        item={item}
                        view={baseView({ items })}
                        labels={labels}
                        on={on}
                    />
                ))}
            </>,
        )
        expect(screen.getByText("Bạn muốn báo cáo theo tuần hay theo tháng?")).toBeInTheDocument()
        expect(screen.getByText(labels.question.waiting("Minh"))).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Trả lời" })).toBeNull()

        const managerViewer: CollabOfficeViewer = { memberId: "mem-minh", role: "manager" }
        rerender(
            <>
                {conversationItemsOfKind(baseView({ viewer: managerViewer, items }), "question-card").map((item) => (
                    <QuestionCard
                        key={item.question.questionId}
                        item={item}
                        view={baseView({ viewer: managerViewer, items })}
                        labels={labels}
                        on={on}
                    />
                ))}
            </>,
        )
        const answer = screen.getByRole("button", { name: "Trả lời" })
        fireEvent.click(answer)
        expect(on.answerQuestion).toHaveBeenCalledWith(TASK_WAITING_ANSWER, QUESTION)
    })
    it("marks the question being answered and cancels it from the composer banner", () => {
        const on = actions()
        const items = buildConversationItems({
            messages: [MESSAGE],
            cards: [],
            tasks: [
                {
                    ...TASK_WAITING_ANSWER,
                    assignedToMemberId: OWNER.memberId,
                    owningModuleDisplayName: null,
                    assignedToDisplayName: null,
                },
            ],
            participants: PARTICIPANTS,
            viewerMemberId: OWNER.memberId,
            unknownAuthor: labels.conversation.unknownAuthor,
        })
        render(
            <>
                {conversationItemsOfKind(
                    baseView({
                        items,
                        composer: {
                            value: "",
                            pending: false,
                            failure: "denied",
                            answering: { questionId: "q-1", moduleName: "sales", excerpt: "Tuần hay tháng?" },
                        },
                    }),
                    "question-card",
                ).map((item) => (
                    <QuestionCard
                        key={item.question.questionId}
                        item={item}
                        view={baseView({
                            items,
                            composer: {
                                value: "",
                                pending: false,
                                failure: "denied",
                                answering: { questionId: "q-1", moduleName: "sales", excerpt: "Tuần hay tháng?" },
                            },
                        })}
                        labels={labels}
                        on={on}
                        compact
                    />
                ))}
            </>,
        )
        expect(screen.getByRole("button", { name: labels.question.answer })).toBeDisabled()
        expect(screen.getByText(labels.question.waiting("sales"))).toBeInTheDocument()
    })
})
