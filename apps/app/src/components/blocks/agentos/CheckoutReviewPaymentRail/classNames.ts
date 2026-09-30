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
/** Class names of the step row. */
export const STEP_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-start", "gap-3")
/** Class names of the ordinal. */
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
/** Class names of the step body. */
export const STEP_BODY_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-0.5")
