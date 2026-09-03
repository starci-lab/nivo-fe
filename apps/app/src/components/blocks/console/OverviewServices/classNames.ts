import { cn } from "@heroui/react";

/** Joined collection boundary: every row line, the surface's own edge closes the set. */
export const OVERVIEW_SERVICES_ROWS_CLASS_NAME = cn("divide-y", "divide-separator");

/** One service row: identity, status and its own onward action. */
export const OVERVIEW_SERVICES_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-center",
  "gap-3",
  "px-4",
  "py-3"
);

/** Row name and detail grouping. */
export const OVERVIEW_SERVICES_COPY_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-1",
  "flex-col",
  "gap-1",
  "break-words"
);

/** Row status and action grouping. */
export const OVERVIEW_SERVICES_END_CLASS_NAME = cn(
  "flex",
  "shrink-0",
  "items-center",
  "gap-3"
);
