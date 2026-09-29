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

/** The invitation title anchors its accepted extra people heading. */
export const GROUP_CHAT_RAIL_SECTION_INVITE_CLASS_NAME = cn(GROUP_CHAT_RAIL_SECTION_CLASS_NAME, "relative")

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

/** The hired-module group starts below the human rows at the direction's position. */
export const GROUP_CHAT_RAIL_SECTION_INVITE_MODULES_CLASS_NAME = cn(
    GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME,
    "min-[70rem]:mt-5",
    "min-[70rem]:pt-4",
)

/** The invitation fields retain their measured lower rail position. */
export const GROUP_CHAT_RAIL_SECTION_INVITE_FORM_CLASS_NAME = cn(
    GROUP_CHAT_RAIL_SECTION_DIVIDED_CLASS_NAME,
    "min-[70rem]:mt-4",
)

/** The accepted extra people heading shares the invitation title row. */
export const GROUP_CHAT_RAIL_HUMANS_BADGE_CLASS_NAME = cn(
    "min-[70rem]:absolute",
    "min-[70rem]:right-16",
    "min-[70rem]:top-6",
)

/** A rail section's label line sits on the card's horizontal rhythm. */
export const GROUP_CHAT_RAIL_LABEL_CLASS_NAME = cn("flex", "items-center", "gap-2", "px-4")

/** A rail section's leading glyph inherits the muted rail tone. */
export const GROUP_CHAT_RAIL_LABEL_ICON_CLASS_NAME = cn("text-muted-foreground", "min-[70rem]:-translate-y-2")

/**
 * The rail section header row carries the label and an optional trailing control. A11Y-4
 * repair (office-r7-rail-control-hit-area, owner decision office-hit-area-decision-r1): the
 * invite IconButton's operable box grows to the 44x44 CSS px minimum while the approved round
 * glyph visual stays - size-11 takes the border box to 44, p-1 plus background-clip:
 * content-box keeps the painted circle at the accepted 36px (the rail only renders at
 * >=48rem, where the icon-only button is 36px; a layered utility wins the vendor's icon-only
 * padding, which lives in `@layer components`), and -m-1 keeps the row's
 * layout footprint unchanged so the roster position is identical.
 */
export const GROUP_CHAT_RAIL_HEAD_ROW_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "items-center",
    "justify-between",
    "gap-2",
    "px-4",
    "[&_.starci-core-icon-button]:size-11",
    "[&_.starci-core-icon-button]:-m-1",
    "[&_.starci-core-icon-button]:p-1",
    "[&_.starci-core-icon-button]:bg-clip-content",
)

/** The invite form band keeps the card's horizontal inset. */
export const GROUP_CHAT_RAIL_FORM_CLASS_NAME = cn("px-4", "pt-1", "pb-3")

/** One member row: avatar, name and role, presence kept textual. */
export const GROUP_CHAT_MEMBER_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-center", "gap-3", "px-4", "py-1.5")
