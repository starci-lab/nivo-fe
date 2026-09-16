import { cn } from "@heroui/react";

/** Host height and three-region grid for the accepted group-chat anatomy. */
export const GROUP_CHAT_HOST_CLASS_NAME = cn("grid", "min-h-[38rem]", "grid-cols-1", "gap-4", "xl:grid-cols-[18rem_1fr]");

/** Direct supporting list, visually quieter than the conversation. */
export const GROUP_LIST_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3");

/** Composer copy remains visible while its unavailable action is disabled. */
export const GROUP_CHAT_COMPOSER_CLASS_NAME = cn("flex", "items-center", "gap-2", "p-3");
