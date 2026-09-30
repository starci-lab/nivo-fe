import { cn } from "@heroui/styles"

/** Focusable control classes shared by the drawer trigger and close trigger. */
export const TRIGGER_CLASS_NAME = cn(
    "min-h-10",
    "rounded-lg",
    "px-3",
    "text-sm",
    "font-semibold",
    "text-foreground",
    "outline-none",
    "data-[focus-visible=true]:ring-2",
    "data-[focus-visible=true]:ring-accent",
)

/** Header classes for the drawer's title and close control. */
export const DRAWER_HEADER_CLASS_NAME = cn("border-b", "border-separator", "px-4", "py-4")

/** Heading classes for the drawer title. */
export const DRAWER_HEADING_CLASS_NAME = cn("text-lg", "font-semibold", "text-foreground")

/** Body class removes the default inner padding. */
export const DRAWER_BODY_CLASS_NAME = cn("p-0")
