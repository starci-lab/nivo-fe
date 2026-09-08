import { cn } from "@heroui/react";

/** Joined collection boundary for owned applications. */
export const APPS_SUMMARY_COLLECTION_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "divide-y",
  "divide-separator"
);

/** Responsive identity, status, and action row for one application. */
export const APPS_SUMMARY_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-center",
  "gap-3",
  "px-4",
  "py-3",
  "first:pt-4",
  "last:pb-4"
);

/** Application name and detail grouping. */
export const APPS_SUMMARY_COPY_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-1",
  "flex-col",
  "gap-1"
);

/** Fixed-width status owner within a wrapping application row. */
export const APPS_SUMMARY_STATUS_CLASS_NAME = cn("shrink-0");

/** Fixed-width command owner within a wrapping application row. */
export const APPS_SUMMARY_ACTION_CLASS_NAME = cn("shrink-0");
