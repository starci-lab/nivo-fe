import { cn } from "@heroui/react";

/** Keep the resolved compact content grouping. */
export const CONTENT_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-2"
);

/** Keep the resolved row inset and separators. */
export const ROW_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "px-4",
  "py-3",
  "last:border-b-0"
);

/** Keep one catalogue offer and its tiers as a readable selection group. */
export const OFFER_CLASS_NAME = cn("flex", "min-w-0", "flex-col", "gap-2", "border-b", "border-separator", "p-4", "last:border-b-0");

/** Keep tier actions compact while allowing long catalogue labels to wrap. */
export const TIER_ACTIONS_CLASS_NAME = cn("flex", "flex-wrap", "gap-2");
