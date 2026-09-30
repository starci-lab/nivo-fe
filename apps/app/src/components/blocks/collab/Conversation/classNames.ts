import { cn } from "@heroui/react"

/** Pick the conversation spacing for the active viewport and Office state. */
export const getGroupChatConversationListClassName = (compact: boolean, decision: boolean): ReturnType<typeof cn> => {
    if (compact) return GROUP_CHAT_CONVERSATION_LIST_COMPACT_CLASS_NAME
    if (decision) return GROUP_CHAT_CONVERSATION_LIST_CLASS_NAME
    return GROUP_CHAT_CONVERSATION_LIST_INVITE_CLASS_NAME
}

/** The ordered conversation list inside the workspace's scroll region. */
const GROUP_CHAT_CONVERSATION_LIST_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "py-1")

/** Invite messages keep the vertical interval shown in the desktop direction. */
const GROUP_CHAT_CONVERSATION_LIST_INVITE_CLASS_NAME = cn(
    GROUP_CHAT_CONVERSATION_LIST_CLASS_NAME,
    "min-[70rem]:gap-3",
)

/** The compact conversation list trims the slot band's outer padding. */
const GROUP_CHAT_CONVERSATION_LIST_COMPACT_CLASS_NAME = cn("flex", "min-w-0", "flex-col")
