import { cn } from "@heroui/react"

/** One conversation entry: avatar rail plus a message or card column. */
export const GROUP_CHAT_ENTRY_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-3", "px-6", "py-4")

/**
 * The compact conversation entry the mobile direction draws: a shorter avatar
 * rail and tighter vertical rhythm, so two accepted messages and a decision card
 * fit the slot band above the docked invitation sheet.
 */
export const GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-2.5", "px-3", "py-0.5")

/** Flexible content column inside one entry or band. */
export const GROUP_CHAT_GROW_CLASS_NAME = cn("min-w-0", "flex-1")

/** Select plain conversation text or the approval state bubble treatment. */
export const getGroupChatMessageBodyClassName = (decision: boolean, isViewer: boolean): ReturnType<typeof cn> => {
    if (!decision) return GROUP_CHAT_MESSAGE_BODY_CLASS_NAME
    return isViewer ? GROUP_CHAT_BUBBLE_OWN_CLASS_NAME : GROUP_CHAT_BUBBLE_CLASS_NAME
}

/** A peer message bubble in decision presentation reads on the secondary surface. */
export const GROUP_CHAT_BUBBLE_CLASS_NAME = cn(
    "inline-block",
    "max-w-[38rem]",
    "rounded-xl",
    "px-3.5",
    "py-2",
    "min-[70rem]:ml-7",
    "min-[70rem]:py-3.5",
    "min-[70rem]:translate-y-4",
    "bg-surface-secondary",
)

/** The viewer's own message bubble reads on the soft accent surface. */
export const GROUP_CHAT_BUBBLE_OWN_CLASS_NAME = cn(
    "inline-block",
    "max-w-[38rem]",
    "rounded-xl",
    "px-3.5",
    "py-2",
    "bg-accent-soft",
    "min-[70rem]:ml-7",
    "min-[70rem]:w-[38.375rem]",
    "min-[70rem]:py-3.5",
    "min-[70rem]:[&_.starci-core-text]:inline-block",
    "min-[70rem]:[&_.starci-core-text]:max-w-[31rem]",
)

/** A plain message body in the growth presentation - text on the card, not a bubble. */
export const GROUP_CHAT_MESSAGE_BODY_CLASS_NAME = cn("max-w-[42rem]")

/** An addressed module mention reads as a soft accent chip inside the body line. */
export const GROUP_CHAT_MENTION_CLASS_NAME = cn(
    "inline-flex",
    "rounded-md",
    "bg-accent-soft",
    "px-1",
    "leading-4",
    "font-semibold",
    "text-accent",
)
