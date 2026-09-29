import type { GroupChatPageLabels } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_ENTRY_CLASS_NAME,
    GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME,
    GROUP_CHAT_GROW_CLASS_NAME,
    getGroupChatMessageBodyClassName,
    GROUP_CHAT_MENTION_CLASS_NAME,
} from "./classNames"
import { Text } from "@starci/grammar/common"
import type { ConversationItem } from "../../../../modules/collab/group-chat/model"
import { displayMessageBody } from "../../../../modules/collab/group-chat/model"
import { MemberAvatar } from "../MemberAvatar"

/** Props for one durable message entry. */
type MessageEntryProps = {
    readonly item: Extract<ConversationItem, { kind: "message" }>
    readonly labels: GroupChatPageLabels
    /**
     * The accepted decision composite reads messages on restrained bubbles while
     * the growth composite keeps them as plain lines on the card surface.
     */
    readonly decision: boolean
    /** The compact slot band reads the tighter row and smaller message body. */
    readonly compact?: boolean
}

/** Render one message with its author and addressed module. */
export const MessageEntry = (props: MessageEntryProps) => {
    const { item, labels, decision, compact = false } = props
    const { message, authorName, authorKind, addressedName, isViewer } = item
    const body = displayMessageBody(message)
    const bodyContent = (
        <>
            {addressedName !== null ? (
                <span className={GROUP_CHAT_MENTION_CLASS_NAME}>{`@${addressedName}`}</span>
            ) : null}
            {addressedName !== null ? " " : null}
            <Text as="span" size={compact ? "xs" : "md"}>
                {body}
            </Text>
        </>
    )
    return (
        <article
            className={compact ? GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME : GROUP_CHAT_ENTRY_CLASS_NAME}
            id={`collab-msg-${message.messageId}`}
        >
            <MemberAvatar name={authorName} kind={authorKind} compact={compact} />
            <div className={GROUP_CHAT_GROW_CLASS_NAME}>
                <Text size={compact ? "xs" : "md"} weight="semibold">
                    {authorName}{" "}
                    <Text as="span" size="xs" tone="muted">
                        {labels.formatTime(message.occurredAt)}
                    </Text>
                </Text>
                <div className={getGroupChatMessageBodyClassName(decision, isViewer)}>{bodyContent}</div>
            </div>
        </article>
    )
}
