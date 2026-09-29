import { cn } from "@heroui/react"

/** One member row: avatar, name and role, presence kept textual. */
export const GROUP_CHAT_MEMBER_ROW_CLASS_NAME = cn("flex", "min-w-0", "items-center", "gap-3", "px-4", "py-1.5")

/** Decision roster rows use the taller desktop rhythm. */
export const GROUP_CHAT_MEMBER_ROW_ROOMY_CLASS_NAME = cn(GROUP_CHAT_MEMBER_ROW_CLASS_NAME, "min-[70rem]:py-2.5")

/** The member row's trailing options glyph stays decorative until member actions exist. */
export const GROUP_CHAT_MEMBER_ROW_TRAILING_CLASS_NAME = cn("ml-auto", "shrink-0", "text-muted-foreground")

/** Flexible content column inside one entry or band. */
export const GROUP_CHAT_GROW_CLASS_NAME = cn("min-w-0", "flex-1")
