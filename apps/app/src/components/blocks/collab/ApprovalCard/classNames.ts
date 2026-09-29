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

/** Constrained column that may shrink but never claim extra width. */
export const GROUP_CHAT_FIELD_BODY_CLASS_NAME = cn("min-w-0")

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

/** Status badges float above a card's joined surface, inside the entry's own inset. */
export const GROUP_CHAT_BADGE_ROW_CLASS_NAME = cn(
    "flex",
    "flex-wrap",
    "items-center",
    "gap-2",
    "pb-1.5",
    "min-[70rem]:pb-4",
)

/** The waiting status line pairs the pending glyph with the muted copy. */
export const GROUP_CHAT_WAITING_LINE_CLASS_NAME = cn("inline-flex", "items-center", "gap-1.5", "text-muted-foreground")

/** The small framed glyph that leads a card band (review mark, info mark, attribution mark). */
export const GROUP_CHAT_BAND_ICON_CLASS_NAME = cn(
    "flex",
    "h-8",
    "w-8",
    "flex-none",
    "items-center",
    "justify-center",
    "rounded-lg",
    "border",
    "border-separator",
    "text-muted-foreground",
    "min-[70rem]:[&_.starci-core-icon]:size-5",
)

/** Actions sit side by side inside the card's final band; the decision keeps the wider share. */
export const GROUP_CHAT_CARD_ACTIONS_CLASS_NAME = cn(
    "flex",
    "gap-3",
    "border-t",
    "border-separator",
    "px-4",
    "py-3",
    "min-[70rem]:py-4",
)

/** The affirmative decision takes the wider share of the action band. */
export const GROUP_CHAT_ACTION_PRIMARY_CLASS_NAME = cn("min-w-0", "flex-[2]", "min-[70rem]:flex-1")

/** The negative decision keeps the smaller share of the action band. */
export const GROUP_CHAT_ACTION_SECONDARY_CLASS_NAME = cn("min-w-0", "flex-1")
