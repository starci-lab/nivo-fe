import { cn } from "@heroui/react";

/** Two-axis mesh for the pod's own fields: a leading seam, row seams and column seams. */
export const OVERVIEW_RUNTIME_FACTS_CLASS_NAME = cn(
  "border-t",
  "divide-y",
  "divide-x",
  "divide-separator",
  "grid",
  "grid-cols-2"
);

/** One pod fact: a value bound to its own label. */
export const OVERVIEW_RUNTIME_CELL_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1",
  "px-4",
  "py-3",
  "break-words"
);
