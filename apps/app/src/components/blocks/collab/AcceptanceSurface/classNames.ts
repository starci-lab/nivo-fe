import { cn } from "@heroui/react"

/** Card bands inside one joined surface: action, consequence, attribution, decision row. */
export const GROUP_CHAT_CARD_BAND_CLASS_NAME = cn(
    "flex",
    "items-start",
    "gap-3",
    "px-4",
    "py-2.5",
    "min-[70rem]:py-[1.125rem]",
)

/** Vertical stack shared by the invite and acceptance forms. */
export const GROUP_CHAT_FORM_STACK_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "flex-1",
    "flex-col",
    "gap-2",
    "min-[70rem]:[&>button]:mt-5",
)
