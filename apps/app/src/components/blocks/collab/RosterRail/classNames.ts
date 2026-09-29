import { cn } from "@heroui/react"

/** One section band inside the joined rail card: a small label above edge-flush rows. */
export const GROUP_CHAT_RAIL_SECTION_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-1",
    "py-1.5",
    "min-[70rem]:py-2",
)

/** The roster title begins lower inside the full-height panel. */
export const GROUP_CHAT_RAIL_SECTION_ROSTER_HEAD_CLASS_NAME = cn(GROUP_CHAT_RAIL_SECTION_CLASS_NAME, "min-[70rem]:pt-5")

/** Rail sections after the first separate with a hairline. */
export const GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-1",
    "border-t",
    "border-separator",
    "py-1.5",
    "min-[70rem]:py-2",
)

/** The decision roster's people heading has its own top inset. */
export const GROUP_CHAT_RAIL_SECTION_ROSTER_PEOPLE_CLASS_NAME = cn(
    GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME,
    "min-[70rem]:pt-5",
)

/** The decision roster's module group follows the taller people rows. */
export const GROUP_CHAT_RAIL_SECTION_ROSTER_MODULES_CLASS_NAME = cn(
    GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME,
    "min-[70rem]:mt-6",
)

/** A rail section's label line sits on the card's horizontal rhythm. */
export const GROUP_CHAT_RAIL_LABEL_CLASS_NAME = cn("flex", "items-center", "gap-2", "px-4")

/** One member row: avatar, name and role, presence kept textual. */
export const GROUP_CHAT_MEMBER_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-center", "gap-3", "px-4", "py-1.5")
