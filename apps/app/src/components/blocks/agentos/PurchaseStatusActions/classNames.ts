import { cn } from "@heroui/react"

/** Keep a keyboard focus ring visible on the surface's primary controls. */
export const ACTION_FOCUS_CLASS_NAME = cn(
    "[&_button:focus-visible]:outline-2",
    "[&_button:focus-visible]:outline-solid",
    "[&_button:focus-visible]:outline-focus",
    "[&_button:focus-visible]:outline-offset-2",
    "[&_button[data-focus-visible=true]]:outline-2",
    "[&_button[data-focus-visible=true]]:outline-solid",
    "[&_button[data-focus-visible=true]]:outline-focus",
    "[&_button[data-focus-visible=true]]:outline-offset-2",
)

/** Center the supporting text below a rail action. */
export const CAPTION_CLASS_NAME = cn("text-center")

/** Align the provisioning escape link below the evidence cards. */
export const ESCAPE_CLASS_NAME = cn("flex", "min-w-0", "justify-start")
