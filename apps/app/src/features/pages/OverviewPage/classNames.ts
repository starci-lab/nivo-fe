import { cn } from "@heroui/react";

/** Page-level rhythm between the orientation header, the signal band and the two operations tracks. */
export const OVERVIEW_FRAME_CLASS_NAME = cn("flex", "flex-col", "gap-6");

/** Shared vertical track measure for the primary and rail stacks. */
export const OVERVIEW_TRACK_CLASS_NAME = cn(
  "flex",
  "w-full",
  "min-w-0",
  "flex-col",
  "gap-4"
);
