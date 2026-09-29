import { ApprovalCard } from "./index"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { CollabApprovalCardView, CollabApprovalView, CollabTaskView } from "../../../../modules/api/collab"
import { buildConversationItems } from "../../../../modules/collab/group-chat/model"
import {
    OWNER,
    STAFF,
    PARTICIPANTS,
    MESSAGE,
    MODULE_MESSAGE,
    BINDING,
    WAITING_APPROVAL,
    TASK_WAITING_APPROVAL,
    labels,
    baseView,
    actions,
    conversationItemsOfKind,
} from "../../../../modules/collab/group-chat/test-fixtures.fixture"

describe("ApprovalCard", () => {
    it("renders a waiting approval card with exactly two eligible actions for an Owner", () => {
        const on = actions()
        const view = baseView({
            items: buildConversationItems({
                messages: [MESSAGE, MODULE_MESSAGE],
                cards: [BINDING],
                tasks: [TASK_WAITING_APPROVAL],
                participants: PARTICIPANTS,
                viewerMemberId: OWNER.memberId,
                unknownAuthor: labels.conversation.unknownAuthor,
            }),
        })
        render(
            <>
                {conversationItemsOfKind(view, "approval-card").map((item) => (
                    <ApprovalCard key={item.approval.approvalId} item={item} view={view} labels={labels} on={on} />
                ))}
            </>,
        )
        expect(screen.getByText("Cần phê duyệt")).toBeInTheDocument()
        expect(screen.getByText("Đang chờ quyết định")).toBeInTheDocument()
        expect(screen.getByText("Gửi báo cáo doanh số cho đối tác")).toBeInTheDocument()
        const approve = screen.getByRole("button", { name: "Phê duyệt" })
        const reject = screen.getByRole("button", { name: "Từ chối" })
        expect(approve).toBeEnabled()
        expect(reject).toBeEnabled()
        fireEvent.click(approve)
        expect(on.pressApproval).toHaveBeenCalledWith("appr-1", "approve")
    })
    it("keeps a waiting card readable but inactive for Staff with the decider statement", () => {
        const on = actions()
        const view = baseView({
            viewer: STAFF,
            items: buildConversationItems({
                messages: [MODULE_MESSAGE],
                cards: [],
                tasks: [TASK_WAITING_APPROVAL],
                participants: PARTICIPANTS,
                viewerMemberId: STAFF.memberId,
                unknownAuthor: labels.conversation.unknownAuthor,
            }),
        })
        render(
            <>
                {conversationItemsOfKind(view, "approval-card").map((item) => (
                    <ApprovalCard key={item.approval.approvalId} item={item} view={view} labels={labels} on={on} />
                ))}
            </>,
        )
        expect(screen.getByText("Chỉ Owner hoặc Manager được quyết định")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Phê duyệt" })).toBeDisabled()
        expect(screen.getByRole("button", { name: "Từ chối" })).toBeDisabled()
    })
    it("renders a settled decision and removes the actions", () => {
        const on = actions()
        const view = baseView({
            settledApprovals: {
                "appr-1": {
                    ...WAITING_APPROVAL,
                    status: "approved",
                    decision: "approve",
                    decidedByMemberId: "mem-an",
                    decidedByDisplayName: "An Nguyen",
                    decidedByRole: "owner",
                    decidedAt: "2026-09-24T10:31:00Z",
                    buttons: ["approve", "reject"],
                },
            },
            items: buildConversationItems({
                messages: [MODULE_MESSAGE],
                cards: [],
                tasks: [
                    {
                        ...TASK_WAITING_APPROVAL,
                        waiting: { kind: "approval", approval: { ...WAITING_APPROVAL, status: "approved" } },
                    },
                ],
                participants: PARTICIPANTS,
                viewerMemberId: OWNER.memberId,
                unknownAuthor: labels.conversation.unknownAuthor,
            }),
        })
        render(
            <>
                {conversationItemsOfKind(view, "approval-card").map((item) => (
                    <ApprovalCard key={item.approval.approvalId} item={item} view={view} labels={labels} on={on} />
                ))}
            </>,
        )
        expect(screen.getByText("An Nguyen đã quyết định lúc 09:14")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Phê duyệt" })).toBeNull()
    })
    it("shows the settled decider, a withdrawn action and a rejected decision on compact cards", () => {
        const rejected: CollabApprovalView = {
            ...WAITING_APPROVAL,
            approvalId: "appr-r",
            status: "rejected",
            consequence: null,
            cardMessageId: null,
        }
        const withdrawn: CollabApprovalView = {
            ...WAITING_APPROVAL,
            approvalId: "appr-w",
            status: "withdrawn",
            cardMessageId: null,
        }
        const approved: CollabApprovalCardView = {
            ...WAITING_APPROVAL,
            buttons: ["approve", "reject"],
            status: "approved",
            decision: "approve",
            decidedByMemberId: OWNER.memberId,
            decidedAt: "2026-09-24T10:30:00Z",
            decidedByDisplayName: "Minh",
            decidedByRole: "manager",
            releaseIntentId: "release-1",
        }
        const task = (approval: CollabApprovalView): CollabTaskView => ({
            ...TASK_WAITING_APPROVAL,
            taskId: `t-${approval.approvalId}`,
            cardMessageId: null,
            waiting: { kind: "approval", approval },
        })
        const items = buildConversationItems({
            messages: [MODULE_MESSAGE],
            cards: [],
            tasks: [TASK_WAITING_APPROVAL, task(rejected), task(withdrawn)],
            participants: PARTICIPANTS,
            viewerMemberId: OWNER.memberId,
            unknownAuthor: labels.conversation.unknownAuthor,
        })
        render(
            <>
                {conversationItemsOfKind(
                    baseView({ items, settledApprovals: { "appr-1": approved } }),
                    "approval-card",
                ).map((item) => (
                    <ApprovalCard
                        key={item.approval.approvalId}
                        item={item}
                        view={baseView({ items, settledApprovals: { "appr-1": approved } })}
                        labels={labels}
                        on={actions()}
                        compact
                    />
                ))}
            </>,
        )
        expect(screen.getByText("Minh đã quyết định lúc 09:14")).toBeInTheDocument()
        expect(screen.getByText(labels.approval.withdrawn)).toBeInTheDocument()
        expect(screen.getByText(labels.statuses.rejected)).toBeInTheDocument()
        expect(screen.getByText(labels.statuses.cancelled)).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: labels.approval.approve })).toBeNull()
    })
    it("announces a denied and an uncertain press while the card keeps waiting", () => {
        const second: CollabApprovalView = { ...WAITING_APPROVAL, approvalId: "appr-2", cardMessageId: null }
        const items = buildConversationItems({
            messages: [MODULE_MESSAGE],
            cards: [],
            tasks: [
                TASK_WAITING_APPROVAL,
                {
                    ...TASK_WAITING_APPROVAL,
                    taskId: "t-2",
                    cardMessageId: null,
                    askedByDisplayName: null,
                    waiting: { kind: "approval", approval: second },
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
                        pressingApprovalId: "appr-2",
                        approvalNotices: { "appr-1": "denied", "appr-2": "uncertain" },
                    }),
                    "approval-card",
                ).map((item) => (
                    <ApprovalCard
                        key={item.approval.approvalId}
                        item={item}
                        view={baseView({
                            items,
                            pressingApprovalId: "appr-2",
                            approvalNotices: { "appr-1": "denied", "appr-2": "uncertain" },
                        })}
                        labels={labels}
                        on={actions()}
                    />
                ))}
            </>,
        )
        expect(screen.getByText(labels.approval.denied)).toBeInTheDocument()
        expect(screen.getByText(labels.approval.uncertain)).toBeInTheDocument()
        expect(screen.getAllByRole("button", { name: labels.approval.approve })).toHaveLength(2)
    })
})
