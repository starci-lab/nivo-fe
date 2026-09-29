import { cn } from "@heroui/react"

/** One flush fact band inside the joined offer surface. */
export const FACT_ROW_CLASS_NAME = cn(
    "border-b",
    "border-separator",
    "flex",
    "min-w-0",
    "flex-col",
    "gap-1",
    "px-4",
    "py-3",
    "last:border-b-0",
    "sm:flex-row",
    "sm:items-baseline",
    "sm:justify-between",
    "sm:gap-4",
)

/** Keep long values readable without crowding their label. */
export const FACT_VALUE_CLASS_NAME = cn("min-w-0", "sm:max-w-[60%]", "sm:text-right")
