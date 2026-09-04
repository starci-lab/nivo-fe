import { cn } from "@heroui/react";

/** Application arrangement of the chat heading and revision action. */
export const PRIVATE_SETUP_HEADER_CLASS_NAME = cn("flex", "min-w-0", "items-center", "gap-3", "p-4");
/** Compact supporting copy within the private chat header. */
export const PRIVATE_SETUP_HEADER_COPY_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2");
/** Reading distance between persisted private conversation turns. */
export const PRIVATE_SETUP_CONVERSATION_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-6", "break-words", "p-4");
/** Readable measure and spacing for initial business guidance. */
export const PRIVATE_SETUP_EMPTY_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2", "max-w-[65ch]", "break-words", "p-4");
/** Compact actor and content pairing within one chat turn. */
export const PRIVATE_SETUP_MESSAGE_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2", "break-words");
/** Application spacing between the controlled draft and send action. */
export const PRIVATE_SETUP_COMPOSER_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4");
/** Spacing for immutable revision guidance. */
export const PRIVATE_SETUP_READONLY_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2", "p-4");
/** Application width and regional spacing around private Setup content. */
export const PRIVATE_SETUP_HOST_CLASS_NAME = cn("w-full", "min-w-0");
