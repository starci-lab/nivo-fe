import { cn } from "@heroui/styles"

/** Hidden trigger kept in the tree so the controlled modal still has an owner. */
export const MODAL_TRIGGER_CLASS_NAME = cn("hidden")

/** Header classes for the modal title and close control. */
export const MODAL_HEADER_CLASS_NAME = cn("border-b", "border-separator", "px-4", "py-4")

/** Heading classes for the modal title. */
export const MODAL_HEADING_CLASS_NAME = cn("text-lg", "font-semibold", "text-foreground")

/** Close control classes: a text button with a visible focus ring. */
export const MODAL_CLOSE_CLASS_NAME = cn(
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

/** Body class removes the default inner padding so the content owns its inset. */
export const MODAL_BODY_CLASS_NAME = cn("p-0")
