import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_ENTRY_CLASS_NAME,
    GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME,
    GROUP_CHAT_CARD_INSET_CLASS_NAME,
    GROUP_CHAT_GROW_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME,
} from "./classNames"
import { SurfaceCard, Text } from "@starci/grammar/common"
import { Badge, Button } from "@starci/grammar/common"
import { shortTaskRef } from "../../../../modules/collab/group-chat/model"
import type { ConversationItem } from "../../../../modules/collab/group-chat/model"

/** Props for one module question card with the assignee's answer affordance. */
type QuestionCardProps = {
    readonly item: Extract<ConversationItem, { kind: "question-card" }>
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    readonly compact?: boolean
}

/** Render an open task question and its answer action. */
export const QuestionCard = (props: QuestionCardProps) => {
    const { item, view, on, labels, compact = false } = props
    const { question, task } = item
    const moduleName = task.owningModuleDisplayName ?? task.owningModuleKey
    const waitingOn = task.assignedToDisplayName ?? ""
    const mayAnswer = view.viewer !== null && task.assignedToMemberId === view.viewer.memberId
    const isAnswering = view.composer.answering?.questionId === question.questionId
    return (
        <div
            className={compact ? GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME : GROUP_CHAT_ENTRY_CLASS_NAME}
            id={`collab-question-${question.questionId}`}
        >
            <div className={GROUP_CHAT_CARD_INSET_CLASS_NAME}>
                <SurfaceCard composition="joined" depth="nested" ariaLabel={question.body}>
                    <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                        <div className={GROUP_CHAT_GROW_CLASS_NAME}>
                            <Text size="xs" weight="medium" tone="muted">
                                {labels.card.reference(shortTaskRef(task.taskId), moduleName)}
                            </Text>
                            <Text size="sm">{question.body}</Text>
                        </div>
                        <Badge tone="warning">{labels.question.waiting(waitingOn)}</Badge>
                    </div>
                    {mayAnswer ? (
                        <div className={GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME}>
                            <Button
                                variant="secondary"
                                size="sm"
                                isDisabled={isAnswering}
                                onPress={() => on.answerQuestion(task, question)}
                            >
                                {labels.question.answer}
                            </Button>
                        </div>
                    ) : null}
                </SurfaceCard>
            </div>
        </div>
    )
}
