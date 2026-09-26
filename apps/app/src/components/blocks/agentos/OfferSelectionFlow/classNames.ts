import { cn } from "@heroui/react";

/** Keep the breadcrumb, heading and offer surface in one readable page flow. */
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

/**
 * One flush offer band: radio, identity and fact pairs stack on a phone and on narrow tablets,
 * grid from the desktop band up. The renewal column reserves enough room for "reauthorization"
 * to survive without a mid-word split at the first grid width.
 */
export const OFFER_ROW_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "flex",
  "min-w-0",
  "flex-col",
  "gap-3",
  "px-4",
  "py-4",
  "last:border-b-0",
  "md:grid",
  "md:grid-cols-[auto_2fr_minmax(0px,1fr)_minmax(7.5rem,1fr)_repeat(2,minmax(0px,1fr))_auto]",
  "md:items-start",
  "md:gap-3"
);

/** A selectable band keeps its pointer affordance and a visible focus ring inside the boundary. */
export const SELECTABLE_OFFER_ROW_CLASS_NAME = cn(
  OFFER_ROW_CLASS_NAME,
  "cursor-pointer",
  "focus-within:ring-2",
  "focus-within:ring-inset",
  "focus-within:ring-accent"
);

/** The owner-accepted selected treatment: one soft accent tint behind the whole band. */
export const SELECTED_OFFER_ROW_CLASS_NAME = cn(
  SELECTABLE_OFFER_ROW_CLASS_NAME,
  "bg-accent-soft"
);

/**
 * The native radio stays the real control; the family accent marks it without hiding semantics.
 * It renders at the accepted direction's mark size (~26px) so the row's primary affordance
 * carries its accepted visual weight.
 */
export const OFFER_RADIO_CLASS_NAME = cn(
  "mt-1",
  "h-[26px]",
  "w-[26px]",
  "shrink-0",
  "accent-accent"
);

/** Offer name and its inseparable amount/currency pair read as one unit. */
export const OFFER_IDENTITY_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-1"
);

/** One row-local fact pair: muted label above its value, wrapping under pressure. */
export const OFFER_FACT_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-0.5"
);

/** The selected-draft summary band: flush, secondary fill, facts beside the identity on desktop. */
export const SUMMARY_BAND_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "bg-surface-secondary",
  "flex",
  "min-w-0",
  "flex-col",
  "gap-3",
  "px-4",
  "py-4",
  "last:border-b-0",
  "sm:flex-row",
  "sm:items-center",
  "sm:justify-between",
  "sm:gap-4"
);

/**
 * The accepted direction's vertical hairline between the selected-draft identity block and the
 * fact grid; it stretches the band height only when the band lays out horizontally.
 */
export const SUMMARY_BAND_DIVIDER_CLASS_NAME = cn(
  "hidden",
  "sm:block",
  "sm:w-px",
  "sm:self-stretch",
  "sm:bg-separator"
);

/** The summary's exact-term cells line up only when the band has room. */
export const SUMMARY_FACTS_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "flex-col",
  "gap-2",
  "sm:flex-row",
  "sm:items-baseline",
  "sm:gap-6"
);

/** The bottom action band: the one onward action plus its no-payment disclosure. */
export const ACTION_BAND_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "flex",
  "min-w-0",
  "flex-col",
  "items-stretch",
  "gap-2",
  "px-4",
  "py-4",
  "last:border-b-0",
  "sm:items-end"
);

/** The action fills the band on a phone, then shrinks to its content on desktop. */
export const ACTION_TARGET_CLASS_NAME = cn(
  "w-full",
  "sm:w-auto"
);

/** The notice band inside the joined surface when offers cannot be read or selected. */
export const NOTICE_BAND_CLASS_NAME = cn(
  "border-b",
  "border-separator",
  "px-4",
  "py-4",
  "last:border-b-0"
);

/**
 * The no-session band keeps its refusal sentence and the Login doors in one readable column, and
 * carries no offer row: this path may disclose no private offer terms at all.
 */
export const NO_SESSION_BAND_CLASS_NAME = cn(
  NOTICE_BAND_CLASS_NAME,
  "flex",
  "min-w-0",
  "flex-col",
  "items-stretch",
  "gap-3"
);
