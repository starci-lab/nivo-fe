import { cn } from "@heroui/react"

/**
 * Root classes for the authenticated dashboard theme boundary: a full-height canvas on the family
 * palette under the console typeface. `--font-open-sans` is written by the console locale layout's
 * next/font instance; `--nivo-font-console` is the family's own stack and answers when the font
 * variable is not set.
 */
export const DASHBOARD_THEME_CLASS_NAME = cn(
    "min-h-dvh",
    "bg-background",
    "text-foreground",
    "font-[family-name:var(--font-open-sans),var(--nivo-font-console)]",
)
