import { cn } from "@heroui/react"

/** Keep the resolved section grouping. */
export const SECTIONS_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-6")

/** Keep the resolved compact content grouping. */
export const CONTENT_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2")

/** Connected-shell facets: separate source-qualified units that stack at mobile and pair at desktop. */
export const SHELL_FACETS_CLASS_NAME = cn("grid", "min-w-0", "grid-cols-1", "gap-4", "md:grid-cols-2")

/** Connected-shell notice: one bounded surface for a settling or refused access state. */
export const SHELL_NOTICE_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2")

/** Connected-shell source time: the observation instant stays beside the heading it qualifies. */
export const SHELL_SOURCE_TIME_CLASS_NAME = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
