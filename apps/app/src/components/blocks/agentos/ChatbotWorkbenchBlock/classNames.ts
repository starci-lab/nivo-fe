import {
  cn,
} from "@heroui/react";

/** Bounded workbench host: ChatWorkspace owns the internal rail, scroll region and action dock. */
export const CHATBOT_WORKSPACE_HOST_CLASS_NAME = cn("flex", "h-96", "min-w-0", "flex-col");

/** Supporting channel and conversation collections share one compact rail rhythm. */
export const CHATBOT_RAIL_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-4");

/** One channel identity keeps its account and state together without depending on color alone. */
export const CHATBOT_CHANNEL_ROW_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2", "break-words");

/** Transcript header pairs the participant identity with the current authority state. */
export const CHATBOT_HEADER_CLASS_NAME = cn("flex", "min-w-0", "flex-wrap", "items-center", "justify-between", "gap-3", "p-4");

/** Ordered transcript reading region. */
export const CHATBOT_TRANSCRIPT_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-4", "p-4");

/** One message row uses alignment as a second direction cue in addition to its metadata. */
export const CHATBOT_MESSAGE_ROW_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2");

/** Outbound messages align to the trailing edge while keeping a readable measure. */
export const CHATBOT_OUTBOUND_MESSAGE_ROW_CLASS_NAME = cn(CHATBOT_MESSAGE_ROW_CLASS_NAME, "items-end");

/** Message content is readable, wraps safely, and remains inside the published surface tokens. */
export const CHATBOT_MESSAGE_BODY_CLASS_NAME = cn("max-w-[65ch]", "rounded-lg", "border", "border-separator", "bg-surface-secondary", "p-4", "break-words");

/** Delivery uncertainty is a separate status region, not part of the message body or handoff authority. */
export const CHATBOT_DELIVERY_NOTICE_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2", "border-t", "border-separator", "pt-3");

/** The action dock stacks on phones and becomes a compact wrapping row when room is available. */
export const CHATBOT_ACTIONS_CLASS_NAME = cn("grid", "min-w-0", "grid-cols-1", "gap-3", "p-4", "sm:grid-cols-3");

/** Workbench heading and approved-context evidence remain one compact orientation block. */
export const CHATBOT_TITLE_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2");
