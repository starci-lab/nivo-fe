import { cn } from "@heroui/react"

/** One conversation entry: avatar rail plus a message or card column. */
export const GROUP_CHAT_ENTRY_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-3", "px-6", "py-4")

/**
 * The compact conversation entry the mobile direction draws: a shorter avatar
 * rail and tighter vertical rhythm, so two accepted messages and a decision card
 * fit the slot band above the docked invitation sheet.
 */
export const GROUP_CHAT_ENTRY_COMPACT_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-2.5", "px-3", "py-0.5")

/** A card entry indents under the author column on wide screens so the card reads attached to its message. */
export const GROUP_CHAT_CARD_INSET_CLASS_NAME = cn("min-w-0", "flex-1", "min-[70rem]:ml-20")

/** Flexible content column inside one entry or band. */
export const GROUP_CHAT_GROW_CLASS_NAME = cn("min-w-0", "flex-1")

/** Card bands inside one joined surface: action, consequence, attribution, decision row. */
export const GROUP_CHAT_CARD_BAND_CLASS_NAME = cn(
    "flex",
    "items-start",
    "gap-3",
    "px-4",
    "py-2.5",
    "min-[70rem]:py-[1.125rem]",
)

/** Card bands after the first separate with an edge-to-edge hairline. */
export const GROUP_CHAT_CARD_BAND_DIVIDED_CLASS_NAME = cn(
    "flex",
    "items-start",
    "gap-3",
    "border-t",
    "border-separator",
    "px-4",
    "py-2.5",
    "min-[70rem]:py-[1.125rem]",
)
