import { cn } from "@heroui/react";

/** Joined collection boundary: every domain row line, the surface's own edge closes the set. */
export const OVERVIEW_ADDRESSES_ROWS_CLASS_NAME = cn("divide-y", "divide-separator");

/** One domain fact row: the label and value cell of one domain fact. */
export const OVERVIEW_ADDRESSES_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-baseline",
  "justify-between",
  "gap-3",
  "px-4",
  "py-3"
);

/** Shrinkable cell that can break a maximum-length DNS label. */
export const OVERVIEW_ADDRESSES_CELL_CLASS_NAME = cn("min-w-0", "flex-1", "break-all");
