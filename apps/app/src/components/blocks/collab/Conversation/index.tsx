import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import { getGroupChatConversationListClassName } from "./classNames"
import { EmptyNotice } from "@starci/grammar/common"
import { useRef } from "react"
import { MessageEntry } from "../MessageEntry"
import { TaskReceiptCard } from "../TaskReceiptCard"
import { ApprovalCard } from "../ApprovalCard"
import { QuestionCard } from "../QuestionCard"
import { NoticesBand } from "../NoticesBand"

/** Props for the ordered conversation region. */
type ConversationProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    /**
     * Compact presentation pins the region to the latest entry whenever the item
     * count changes; the callback ref fires on every commit, so the pinned count
     * keeps user scrolls intact between arrivals.
     */
    readonly compact?: boolean
    /** The decision composite's restrained bubble treatment replaces plain lines. */
    readonly decision: boolean
}

/** Render the ordered message, card, and notice sequence. */
export const Conversation = (props: ConversationProps) => {
    const { view, on, labels, compact = false, decision } = props
    const itemCount = view.items.length
    const pinnedCountRef = useRef(-1)
    const pinToLatest = (el: HTMLDivElement | null) => {
        if (!compact || el === null || pinnedCountRef.current === itemCount) {
            return
        }
        pinnedCountRef.current = itemCount
        const owner = el.closest("[data-grammar-chat-workspace-scroll-owner='conversation']")
        if (owner instanceof HTMLElement) {
            owner.scrollTop = owner.scrollHeight
        }
    }
    return (
        <div ref={pinToLatest} className={getGroupChatConversationListClassName(compact, decision)}>
            <NoticesBand view={view} on={on} labels={labels} />
            {view.items.length === 0 ? (
                <EmptyNotice message={labels.conversation.empty} />
            ) : (
                view.items.map((item, index) => {
                    switch (item.kind) {
                        case "message":
                            return (
                                <MessageEntry
                                    key={item.message.messageId}
                                    item={item}
                                    labels={labels}
                                    decision={decision}
                                    compact={compact}
                                />
                            )
                        case "task-card":
                            return (
                                <TaskReceiptCard
                                    key={`${item.binding.bindingId}-${index}`}
                                    item={item}
                                    labels={labels}
                                    compact={compact}
                                />
                            )
                        case "approval-card":
                            return (
                                <ApprovalCard
                                    key={item.approval.approvalId}
                                    item={item}
                                    view={view}
                                    on={on}
                                    labels={labels}
                                    compact={compact}
                                />
                            )
                        case "question-card":
                            return (
                                <QuestionCard
                                    key={item.question.questionId}
                                    item={item}
                                    view={view}
                                    on={on}
                                    labels={labels}
                                    compact={compact}
                                />
                            )
                        default:
                            return null
                    }
                })
            )}
        </div>
    )
}
