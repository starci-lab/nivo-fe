import { cn } from "@heroui/react";
import type { TextLinkSize } from "./index";

/** Stable classes for the text-link reading step and selected state. */
export const TEXT_LINK_SIZE_CLASS_NAMES: Record<TextLinkSize, ReturnType<typeof cn>> = {
  sm: cn("text-sm"),
  md: cn("text-base")
};
/** Choice links receive a compact pill target when selection state is supplied. */
export const TEXT_LINK_CHOICE_CLASS_NAME = cn("rounded-full", "px-2", "py-1");
/** The selected choice uses the semantic accent pair. */
export const TEXT_LINK_SELECTED_CLASS_NAME = cn("bg-accent-soft", "text-accent-soft-foreground");
