import { cn } from "@heroui/react";

/** Keep the dashboard summary and collection in one predictable reading flow. */
export const DASHBOARD_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-4"
);

/** Stack on narrow screens, then become three equal at-a-glance signals. */
export const SUMMARY_GRID_CLASS_NAME = cn(
  "grid",
  "min-w-0",
  "grid-cols-1",
  "divide-y",
  "divide-separator",
  "sm:grid-cols-3",
  "sm:divide-x",
  "sm:divide-y-0"
);

/** Keep every figure, label and explanation readable as one unit. */
export const SUMMARY_CELL_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1",
  "px-4",
  "py-4"
);

/** Give collection groups a visible, theme-token-backed boundary. */
export const GROUP_LABEL_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "bg-surface-secondary",
  "px-4",
  "py-3"
);

/** Keep the resolved row inset and separators while adapting action placement. */
export const ROW_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "flex",
  "min-w-0",
  "flex-col",
  "gap-3",
  "px-4",
  "py-4",
  "last:border-b-0",
  "sm:flex-row",
  "sm:items-center",
  "sm:justify-between"
);

/** Let long workspace names and references wrap without moving the controls. */
export const IDENTITY_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1"
);

/** Keep status and destination together, with room to wrap on a narrow phone. */
export const ACTIONS_CLASS_NAME = cn(
  "flex",
  "flex-wrap",
  "items-center",
  "gap-2",
  "sm:shrink-0",
  "sm:justify-end"
);
