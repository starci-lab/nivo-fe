import { cn } from "@heroui/react"

/** Keep each member's tint while selecting the compact avatar size. */
export const getGroupChatAvatarClassName = (compact: boolean, tint: string): ReturnType<typeof cn> =>
    cn(compact ? GROUP_CHAT_AVATAR_COMPACT_CLASS_NAME : GROUP_CHAT_AVATAR_CLASS_NAME, tint)

/** The avatar frame both the wide and compact member avatars build on. */
const GROUP_CHAT_AVATAR_BASE_CLASS_NAME = cn(
    "relative",
    "flex",
    "shrink-0",
    "items-center",
    "justify-center",
    "rounded-full",
    "font-semibold",
    "text-foreground",
)

/** Tinted initials avatar circle shared by humans and modules. */
const GROUP_CHAT_AVATAR_CLASS_NAME = cn(GROUP_CHAT_AVATAR_BASE_CLASS_NAME, "h-10", "w-10", "text-sm")

/** The compact avatar the mobile direction's tighter message rows use. */
const GROUP_CHAT_AVATAR_COMPACT_CLASS_NAME = cn(GROUP_CHAT_AVATAR_BASE_CLASS_NAME, "h-8", "w-8", "text-xs")

/** The presence dot docked at a member avatar's lower edge. */
export const GROUP_CHAT_AVATAR_PRESENCE_CLASS_NAME = cn(
    "absolute",
    "-bottom-0.5",
    "-right-0.5",
    "h-2.5",
    "w-2.5",
    "rounded-full",
    "bg-success",
    "ring-2",
    "ring-surface",
)
