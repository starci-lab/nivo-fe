import { cn } from "@heroui/react"

/** Tasks filter row: three labelled selects in one reading line on wide screens. */
export const GROUP_CHAT_FILTERS_CLASS_NAME = cn("grid", "grid-cols-1", "gap-3", "sm:grid-cols-3")

/** The Tasks tab column: filters, hint, then the list card inside its own scroll region. */
export const GROUP_CHAT_TASKS_COLUMN_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-4", "p-4")

/** One Tasks row: ref, statement and status, then attribution, then the Office jump. */
export const GROUP_CHAT_TASK_ROW_CLASS_NAME = cn(
    "grid",
    "grid-cols-1",
    "gap-2",
    "px-4",
    "py-3",
    "lg:grid-cols-[6rem_1fr_auto_auto_auto_auto]",
    "lg:items-center",
    "lg:gap-4",
)

/** A task statement cell may shrink inside the row's flexible track so truncation works. */
export const GROUP_CHAT_TASK_STATEMENT_CLASS_NAME = cn("min-w-0")
