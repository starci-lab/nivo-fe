import { cn } from "@heroui/react";

/** Keep the breadcrumb, heading and decision surfaces in one readable page flow. */
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

/** One flush fact band inside a joined surface: label/value pair that stacks on a narrow phone. */
export const FACT_ROW_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1",
  "px-4",
  "py-3",
  "last:border-b-0",
  "sm:flex-row",
  "sm:items-baseline",
  "sm:justify-between",
  "sm:gap-4"
);

/** Keep long values readable without letting them crowd out their label. */
export const FACT_VALUE_CLASS_NAME = cn(
  "min-w-0",
  "sm:max-w-[60%]",
  "sm:text-right"
);

/** One flush rail band: note, step, action or footnote region inside the joined rail surface. */
export const RAIL_BAND_CLASS_NAME = cn(
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

/** Ordered step row: ordinal circle beside its label and detail. */
export const STEP_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "items-start",
  "gap-3"
);

/** The plain ordinal marker; order is carried by the list, never by a status glyph. */
export const ORDINAL_CLASS_NAME = cn(
  "flex",
  "h-6",
  "w-6",
  "shrink-0",
  "items-center",
  "justify-center",
  "rounded-full",
  "bg-surface-secondary",
  "text-xs",
  "font-medium",
  "text-foreground"
);

/** Keep one ordered step's title and detail as a single semantic unit. */
export const STEP_BODY_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-0.5"
);

/** The rail choice stacks one option per row so each label and its detail stay readable. */
export const RAIL_OPTIONS_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-2"
);

/** One selectable rail option: a real radio, its label and its own detail. */
export const RAIL_OPTION_CLASS_NAME = cn(
  "border",
  "border-separator",
  "flex",
  "min-w-0",
  "cursor-pointer",
  "items-start",
  "gap-3",
  "rounded-md",
  "px-3",
  "py-2"
);

/** The chosen rail wears the family accent; selection is stated by the control itself. */
export const SELECTED_RAIL_OPTION_CLASS_NAME = cn(
  RAIL_OPTION_CLASS_NAME,
  "border-accent",
  "bg-accent-soft"
);

/** The native radio stays the real control and the family accent marks it. */
export const RAIL_RADIO_CLASS_NAME = cn(
  "mt-1",
  "h-4",
  "w-4",
  "shrink-0",
  "accent-accent"
);
