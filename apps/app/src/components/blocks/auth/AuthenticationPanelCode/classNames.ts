import { cn } from "@heroui/react"

/** Keeps the code step's surface content in one vertical rhythm. */
export const AUTH_PANEL_CLASS_NAME = cn("flex", "flex-col", "gap-6")
/** Groups the code inputs and actions as one form. */
export const AUTH_PANEL_FORM_CLASS_NAME = cn("flex", "flex-col", "gap-4")
/** Wraps the resend action without letting it overflow on narrow screens. */
export const AUTH_PANEL_TEXT_ACTIONS_CLASS_NAME = cn("flex", "flex-wrap", "items-center", "gap-x-3", "gap-y-2")
