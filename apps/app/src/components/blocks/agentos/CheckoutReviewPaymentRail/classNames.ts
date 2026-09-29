import { cn } from "@heroui/react"

/** One flush rail band inside the joined payment surface. */
export const RAIL_BAND_CLASS_NAME = cn(
    "border-b",
    "border-separator",
    "flex",
    "min-w-0",
    "flex-col",
    "gap-3",
    "px-4",
    "py-4",
    "last:border-b-0",
)
export const STEP_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-3")
export const ORDINAL_CLASS_NAME = cn(
    "flex",
    "h-6",
    "w-6",
    "shrink-0",
    "items-center",
    "justify-center",
    "rounded-full",
    "bg-surface-secondary",
    "text-xs",
    "font-medium",
    "text-foreground",
)
export const STEP_BODY_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-0.5")
export const RAIL_OPTIONS_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2")
export const RAIL_OPTION_CLASS_NAME = cn(
    "border",
    "border-separator",
    "flex",
    "min-w-0",
    "cursor-pointer",
    "items-start",
    "gap-3",
    "rounded-md",
    "px-3",
    "py-2",
)
export const SELECTED_RAIL_OPTION_CLASS_NAME = cn(RAIL_OPTION_CLASS_NAME, "border-accent", "bg-accent-soft")
export const RAIL_RADIO_CLASS_NAME = cn("mt-1", "h-4", "w-4", "shrink-0", "accent-accent")
