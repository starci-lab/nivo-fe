import { cn } from "@heroui/styles"

/** Visually hides the rail heading while retaining its landmark semantics. */
export const RAIL_HEADING_CLASS_NAME = cn("sr-only")

/** Root classes for the responsive navigation rail: hidden below 48rem, a flex track above it. */
export const RAIL_CLASS_NAME = cn("hidden", "text-foreground", "md:flex")

/** Classes for the keyboard-accessible rail toggle. */
export const RAIL_CONTROL_CLASS_NAME = cn(
    "size-11",
    "cursor-pointer",
    "rounded-full",
    "[border:0]",
    "bg-transparent",
    "text-foreground",
    "hover:bg-default",
    "focus-visible:outline-2",
    "focus-visible:outline-solid",
    "focus-visible:outline-focus",
    "focus-visible:outline-offset-2",
)
