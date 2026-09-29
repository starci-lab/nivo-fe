import type { GroupChatPageLabels } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_ENTRY_CLASS_NAME,
    GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME,
    GROUP_CHAT_CARD_INSET_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_CLASS_NAME,
    GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME,
} from "./classNames"
import { SurfaceCard, Text } from "@starci/grammar/common"
import { Badge } from "@starci/grammar/common"
import { shortTaskRef, taskStatusTone } from "../../../../modules/collab/group-chat/model"
import type { ConversationItem } from "../../../../modules/collab/group-chat/model"

/** Props for one task receipt card bound to its source message. */
type TaskReceiptCardProps = {
    readonly item: Extract<ConversationItem, { kind: "task-card" }>
    readonly labels: GroupChatPageLabels
    readonly compact?: boolean
}

/** Render the task receipt attached to a source message. */
export const TaskReceiptCard = (props: TaskReceiptCardProps) => {
    const { item, labels, compact = false } = props
    const { binding, task } = item
    const status = task?.status ?? null
    const receipt = binding.receipt
    const receiptLabel =
        receipt.disposition === "reported"
            ? labels.card.receiptReported
            : receipt.disposition === "refused"
              ? labels.card.receiptRefused
              : labels.card.receiptPending
    const moduleName = task?.owningModuleDisplayName ?? binding.receiverModuleKey
    const ref = task === null ? binding.commandName : shortTaskRef(task.taskId)
    return (
        <div
            className={compact ? GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME : GROUP_CHAT_ENTRY_CLASS_NAME}
            id={task === null ? undefined : `collab-task-${task.taskId}`}
        >
            <div className={GROUP_CHAT_CARD_INSET_CLASS_NAME}>
                <SurfaceCard composition="joined" depth="nested" ariaLabel={task?.statement ?? binding.commandName}>
                    <div className={GROUP_CHAT_CARD_BAND_CLASS_NAME}>
                        <Text size={compact ? "sm" : "md"} weight="semibold">
                            {task?.statement ?? binding.commandName}
                        </Text>
                        {status !== null ? (
                            <Badge tone={taskStatusTone(status)}>{labels.statuses[status]}</Badge>
                        ) : null}
                        <Badge
                            tone={
                                receipt.disposition === "refused"
                                    ? "danger"
                                    : receipt.disposition === "reported"
                                      ? "success"
                                      : "neutral"
                            }
                        >
                            {receiptLabel}
                        </Badge>
                    </div>
                    <div className={GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME}>
                        <Text size="xs" tone="muted">
                            {labels.card.reference(ref, moduleName)}
                            {task?.askedByDisplayName ? ` • ${labels.card.requestedBy(task.askedByDisplayName)}` : ""}
                            {task?.assignedToDisplayName
                                ? ` • ${labels.card.assignedTo(task.assignedToDisplayName)}`
                                : ""}
                        </Text>
                    </div>
                </SurfaceCard>
            </div>
        </div>
    )
}
