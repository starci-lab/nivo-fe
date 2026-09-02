import { cn } from "@heroui/react"

/** Responsive horizontal owner for the two top-bar groups. */
export const CONSOLE_TOP_BAR_CLASS_NAME = cn(
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-center",
    "justify-between",
    "gap-3",
)

/** Keep product identity together while allowing the surrounding bar to wrap. */
export const CONSOLE_TOP_BAR_IDENTITY_CLASS_NAME = cn("flex", "min-w-0", "items-center", "gap-3")

/** Keep capability-backed controls horizontal and let them wrap on narrow viewports. */
export const CONSOLE_TOP_BAR_ACTIONS_CLASS_NAME = cn(
    "flex",
    "max-w-full",
    "flex-wrap",
    "items-center",
    "justify-end",
    "gap-2",
)

/** Mobile-only owner for the destination drawer trigger. */
export const CONSOLE_TOP_BAR_DRAWER_CLASS_NAME = cn("md:hidden")
