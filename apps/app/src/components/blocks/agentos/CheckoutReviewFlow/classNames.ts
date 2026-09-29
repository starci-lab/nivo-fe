import { cn } from "@heroui/react"

/** Keep the breadcrumb, heading and decision surfaces in one readable page flow. */
export const SECTIONS_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-5")

/** Inline breadcrumb steps; separators are text so the list stays semantic. */
export const BREADCRUMB_LIST_CLASS_NAME = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")

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
