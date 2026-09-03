import { cn } from "@heroui/react";

/** Two-axis mesh: a leading seam under the label row, row seams, and column seams that stack under
 * the rail query and become columns above it. Off the closed scale, `grid-cols` takes no arbitrary
 * value, so the fluid auto-fit template steps down to the nearest closed-scale count instead. */
export const OVERVIEW_SIGNALS_BAND_CLASS_NAME = cn(
  "border-t",
  "divide-y",
  "divide-x",
  "divide-separator",
  "grid",
  "grid-cols-2",
  "lg:grid-cols-4"
);

/** One peer signal cell: label, value and status read as one unit. */
export const OVERVIEW_SIGNALS_CELL_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-2",
  "px-4",
  "py-3",
  "break-words"
);
