import { cn } from "@heroui/react";

/** Joined collection boundary for infrastructure facts. */
export const INFRASTRUCTURE_SUMMARY_COLLECTION_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "divide-y",
  "divide-separator"
);

/** Balanced label and value row for one infrastructure fact. */
export const INFRASTRUCTURE_SUMMARY_FACT_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-baseline",
  "justify-between",
  "gap-3",
  "px-4",
  "py-3",
  "first:pt-4",
  "last:pb-4"
);

/** Shrinkable fact column that can break a maximum-length DNS label. */
export const INFRASTRUCTURE_SUMMARY_FACT_COLUMN_CLASS_NAME = cn(
  "min-w-0",
  "flex-1",
  "break-all"
);

/** Content grouping for empty or failed infrastructure evidence. */
export const INFRASTRUCTURE_SUMMARY_FALLBACK_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-4"
);

/** Overflow-safe infrastructure note owner. */
export const INFRASTRUCTURE_SUMMARY_NOTE_CLASS_NAME = cn("min-w-0");
