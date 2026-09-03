import { cn } from "@heroui/react";

/** Two-cell band: a leading seam under the label row, one seam between balance and unpaid count. */
export const OVERVIEW_ACCOUNT_FACTS_CLASS_NAME = cn(
  "border-t",
  "divide-x",
  "divide-separator",
  "grid",
  "grid-cols-2"
);

/** One account fact: a value bound to its own label. */
export const OVERVIEW_ACCOUNT_FACT_CELL_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1",
  "px-4",
  "py-3"
);

/** Second band stacked under the facts band: the one invoice row that owes the next step. */
export const OVERVIEW_ACCOUNT_ROWS_CLASS_NAME = cn("border-t", "divide-y", "divide-separator");

/** The invoice row: identity, status and its own top-up action. */
export const OVERVIEW_ACCOUNT_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-center",
  "gap-3",
  "px-4",
  "py-3"
);

/** Invoice name and detail grouping. */
export const OVERVIEW_ACCOUNT_COPY_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-1",
  "flex-col",
  "gap-1",
  "break-words"
);

/** Invoice status and action grouping. */
export const OVERVIEW_ACCOUNT_END_CLASS_NAME = cn(
  "flex",
  "shrink-0",
  "items-center",
  "gap-3"
);
