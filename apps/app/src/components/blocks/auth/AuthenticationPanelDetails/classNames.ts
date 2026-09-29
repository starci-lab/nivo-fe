import { cn } from "@heroui/react"

/** Sets the first step's vertical surface rhythm. */
export const AUTH_PANEL_CLASS_NAME = cn("flex", "flex-col", "gap-6")
/** Separates sign-in shortcuts from credential entry. */
export const AUTH_PANEL_DETAILS_CLASS_NAME = cn("flex", "flex-col", "gap-6")
/** Groups the credential controls as one form. */
export const AUTH_PANEL_FORM_CLASS_NAME = cn("flex", "flex-col", "gap-4")
/** Keeps the remember-me switch and journey link at opposite ends. */
export const AUTH_PANEL_OPTIONS_CLASS_NAME = cn("!flex", "items-center", "justify-between", "gap-4")
/** Stacks provider shortcuts above the divider. */
export const AUTH_PANEL_PROVIDER_CLASS_NAME = cn("flex", "flex-col", "gap-3")
