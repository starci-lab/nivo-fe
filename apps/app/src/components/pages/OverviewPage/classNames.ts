import { cn } from "@heroui/react";

/** Page-level rhythm for the account operations briefing. */
export const OVERVIEW_PAGE_CLASS_NAME = cn("flex", "flex-col", "gap-6");

/** Reflow the page-level decision header before the Grammar rail container begins. */
export const OVERVIEW_HEADER_CLASS_NAME = cn(
  "flex-col",
  "items-start",
  "sm:flex-row",
  "sm:items-end",
  "sm:justify-between"
);

/** Shared vertical section measure for services and account evidence. */
export const OVERVIEW_SECTION_CLASS_NAME = cn(
  "flex",
  "w-full",
  "min-w-0",
  "flex-col",
  "gap-4"
);
