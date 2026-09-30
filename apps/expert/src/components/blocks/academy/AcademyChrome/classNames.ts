import { cn } from "@heroui/react"

/** The id of the one main landmark the academy chrome renders; the skip link targets it. */
export const ACADEMY_MAIN_ID = "main-content"

/** The skip link: off screen until it takes focus, then the first thing a keyboard reader sees. */
export const ACADEMY_SKIP_LINK_CLASS_NAME = cn(
    "fixed",
    "top-3",
    "left-4",
    "z-[100]",
    "min-h-11",
    "-translate-y-[180%]",
    "rounded-lg",
    "bg-foreground",
    "px-4",
    "py-3",
    "font-bold",
    "text-background",
    "focus:translate-y-0",
)

/** The reader's own controls row, right aligned above the page. */
export const ACADEMY_TOOLBAR_CLASS_NAME = cn("flex", "justify-end", "px-4", "py-2")
