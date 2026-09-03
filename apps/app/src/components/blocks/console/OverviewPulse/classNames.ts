import { cn } from "@heroui/react";

/** Neutral opening band naming what the card summarises, before the divided signal rows. */
export const OVERVIEW_PULSE_SUMMARY_CLASS_NAME = cn("px-4", "pt-4", "pb-3");

/** Joined boundary for independently settled overview signals. */
export const OVERVIEW_PULSE_COLLECTION_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "border-t",
  "border-separator",
  "divide-y",
  "divide-separator"
);

/** Reading row for one account signal. */
export const OVERVIEW_PULSE_SIGNAL_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "items-start",
  "gap-3",
  "px-4",
  "py-3",
  "last:pb-4"
);

/** Copy owner beside one signal icon. */
export const OVERVIEW_PULSE_SIGNAL_CONTENT_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-1",
  "flex-col",
  "gap-3"
);

/** Value and caption grouping for one signal. */
export const OVERVIEW_PULSE_SIGNAL_FACT_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1"
);
