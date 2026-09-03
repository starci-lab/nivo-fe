import { cn } from "@heroui/react";

/** Page-level rhythm between the orientation header, the attention card and the two operations tracks. */
export const OVERVIEW_FRAME_CLASS_NAME = cn("flex", "flex-col", "gap-6");

/** Shared vertical section measure for services and account evidence. */
export const OVERVIEW_SECTION_CLASS_NAME = cn(
  "flex",
  "w-full",
  "min-w-0",
  "flex-col",
  "gap-4"
);
