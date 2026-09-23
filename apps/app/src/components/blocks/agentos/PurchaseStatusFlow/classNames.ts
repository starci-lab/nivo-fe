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

/** One divided confirmed-fact row: muted label left, value right. */
export const FACT_ROW_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "items-baseline",
  "justify-between",
  "gap-3"
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

/*
 * Loading-preview geometry reserves: the skeleton draws a single-line bar where the resolved
 * surface wraps to two, so the band or head line that stands in for it reserves the resolved
 * rank at exactly the widths the resolved content wraps. The wrap is a function of the card's
 * own width, so the fact-row reserve queries the `starci-core-surface` container - it answers
 * for the stacked phone card and the fixed-width rail column alike, where a viewport query or
 * an unnamed container query (which resolves against the surface card, not the rail layout)
 * cannot describe the resolved wrap.
 */

/** The confirmed-fact row whose resolved value wraps to two lines once the card itself is narrow. */
export const SKELETON_FACT_ROW_RESERVED_CLASS_NAME = cn(
  BAND_CLASS_NAME,
  "@max-[400px]/starci-core-surface:min-h-[73px]"
);

/**
 * The loading provisioning title's resolved rank: the resolved heading carries its badge inside
 * the title and wraps to two lines on a narrow page, so the single-line skeleton title reserves
 * that second line at the viewport where the resolved wrap occurs.
 */
export const SKELETON_TITLE_RESERVED_CLASS_NAME = cn(
  "block",
  "max-[540px]:min-h-[49px]"
);

/** The provisioning footnote band; the resolved order sentence wraps to three lines on a phone card. */
export const SKELETON_FOOTNOTE_RESERVED_CLASS_NAME = cn(
  BAND_CLASS_NAME,
  "max-[620px]:min-h-[81px]"
);

/** The payment banner band; the resolved offer strip wraps to three lines on a phone card. */
export const SKELETON_BANNER_RESERVED_CLASS_NAME = cn(
  BAND_CLASS_NAME,
  "max-[430px]:min-h-[105px]"
);

/**
 * The consumed Grammar button paints no keyboard-focus treatment on this surface (measured:
 * data-focus-visible=true with no outline, ring or colour delta). HeroUI's unlayered
 * `outline-style: none` beats every layered utility, so the ring itself is the unlayered
 * `.purchase-status-action` descendant rule in globals.css - the family's own contract
 * (2px solid var(--focus), 2px offset) - while this hook keeps the treatment owned here.
 */
export const ACTION_FOCUS_CLASS_NAME = cn("purchase-status-action");

/** Page-level escape link row, used where the rail band already holds the onward action. */
export const ESCAPE_CLASS_NAME = cn(
  "flex",
  "min-w-0",
  "justify-start"
);
