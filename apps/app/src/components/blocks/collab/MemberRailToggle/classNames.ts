import { cn } from "@heroui/react"

/** Compact member chip: a keyboard-sized pill that opens the docked member sheet. */
export const GROUP_CHAT_MEMBER_CHIP_CLASS_NAME = cn(
    "inline-flex",
    "h-8",
    "shrink-0",
    "items-center",
    "gap-1.5",
    "rounded-full",
    "border",
    "border-separator",
    "bg-surface",
    "px-3",
    "text-sm",
    "font-semibold",
    "text-foreground",
    "outline-none",
    "data-[focus-visible=true]:ring-2",
    "data-[focus-visible=true]:ring-accent",
)

/** The member chip's leading roster icon. */
export const GROUP_CHAT_MEMBER_CHIP_ICON_CLASS_NAME = cn("h-4", "w-4")

/** The member chip's trailing disclosure chevron. */
export const GROUP_CHAT_MEMBER_CHIP_CHEVRON_CLASS_NAME = cn("h-3.5", "w-3.5")
