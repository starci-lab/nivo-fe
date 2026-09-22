import { cn } from "@heroui/react";

/** Keep the breadcrumb, heading and status surfaces in one readable page flow. */
export const SECTIONS_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-5"
);

/** Inline breadcrumb steps; separators are text so the list stays semantic. */
export const BREADCRUMB_LIST_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-center",
  "gap-2"
);

/** One flush band inside a joined surface: rows keep the hairline separator until the last band. */
export const BAND_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "flex",
  "min-w-0",
  "flex-col",
  "gap-3",
  "px-4",
  "py-4",
  "last:border-b-0"
);

/** The offer banner strip inside the purchase-facts or provisioning-order surface. */
export const BANNER_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-wrap",
  "items-baseline",
  "gap-x-2",
  "gap-y-1",
  "rounded-lg",
  "bg-surface-secondary",
  "px-4",
  "py-3"
);

/** Two-column fact grid that collapses to label/value rows on a narrow phone. */
export const FACT_GRID_CLASS_NAME = cn(
  "grid",
  "min-w-0",
  "grid-cols-1",
  "gap-4",
  "sm:grid-cols-2"
);

/** One fact cell: the label sits above its value so long values never crowd the label out. */
export const FACT_CELL_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1"
);

/** One evidence or confirmed-fact row: status badge beside a label/detail column. */
export const ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "items-start",
  "gap-3"
);

/** Keep one row's label, detail and timestamp as a single semantic unit. */
export const ROW_BODY_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-1",
  "flex-col",
  "gap-0.5"
);

/** Row head keeps the status badge adjacent to the row's own label. */
export const ROW_HEAD_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "items-center",
  "justify-between",
  "gap-2"
);

/** The caution or notice band inside a rail; the badge carries caution so colour never stands alone. */
export const NOTICE_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "items-start",
  "gap-3",
  "rounded-lg",
  "border",
  "border-separator",
  "bg-surface-secondary",
  "px-4",
  "py-3"
);

/** Centred caption under a rail action. */
export const CAPTION_CLASS_NAME = cn("text-center");

/** Page-level escape link row, used where the rail band already holds the onward action. */
export const ESCAPE_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "justify-start"
);
