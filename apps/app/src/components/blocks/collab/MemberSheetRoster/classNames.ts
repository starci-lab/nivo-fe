import { cn } from "@heroui/react"

/** Roster groups inside the member sheet when the viewer may not invite; rows stay edge-flush. */
export const GROUP_CHAT_SHEET_ROSTER_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3", "-mx-4")

/** One roster group in the member sheet: a section label above plain member rows. */
export const GROUP_CHAT_SHEET_SECTION_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-1")

/** A sheet section's label or note line keeps the body's horizontal inset. */
export const GROUP_CHAT_SHEET_SECTION_LABEL_CLASS_NAME = cn("px-4")
