import { cn, Typography, skeletonVariants } from "@heroui/react";

/**
 * LEAF - `Heading`: the name of a thing, at a level of the document outline.
 *
 * `level` DRIVES BOTH THE TAG AND THE SET, so the outline a screen reader walks and the sizes a
 * reader sees can never disagree. A caller raising the level is saying something true about the
 * page, never making the words bigger.
 */

/** How deep in the outline this title sits. Four levels is as deep as a page should go. */
export type HeadingLevel = 1 | 2 | 3 | 4;

/** Visual emphasis that does not change the document outline. */
export type HeadingScale = "standard" | "display";

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type HeadingData = {
  /** The already-resolved title. Absent while loading. */
  readonly content?: string;
  /** Which level of the document outline this is. */
  readonly level?: HeadingLevel;
  /** `display` is reserved for an accepted page-root title; outline semantics still come from `level`. */
  readonly scale?: HeadingScale;
  /** Optional placement class for a caller-owned presentation boundary. */
  readonly className?: string;
};

/** Props for {@link Heading}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type HeadingProps = {readonly props: HeadingData;readonly isLoading?: boolean;};

/**
 * The set per outline level - the tag comes from `level`, these are the type metrics.
 *
 * THE STEP FROM 2 TO 3 IS A WEIGHT, NOT A SIZE, and that is deliberate. A section label repeats
 * down a whole column; set at the same weight as the surface title above it, a screenful of them
 * reads as a dozen competing titles rather than as the names of the things under them. Dropping to
 * medium is enough to rank them without making the words harder to read, which another size step
 * down would.
 */
const LEVEL_CLASSES = {
  1: "text-xl font-semibold tracking-tight",
  2: "text-base font-semibold",
  3: "text-sm font-medium",
  4: "text-xs font-medium text-muted"
} as const;

/** The page-root display treatment is opt-in; every existing heading keeps its level recipe. */
const DISPLAY_CLASSES = "text-4xl font-semibold leading-tight tracking-tight";

/** The resting shape - the same line box with the glyphs out. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
  className: "select-none text-transparent"
});

/**
 * Draw a title.
 *
 * @param input - {@link HeadingProps}
 */
export const Heading = (props: HeadingProps) => HeadingView(props);
const HeadingView = ({ props, isLoading = false }: HeadingProps) => {
  const level = props.level ?? 2;
  const scale = props.scale ?? "standard";
  const classes = scale === "display" ? DISPLAY_CLASSES : LEVEL_CLASSES[level];
  return (
    <Typography.Heading


      data-level={level}
      data-scale={scale}
      data-loading={isLoading ? "true" : "false"}
      aria-hidden={isLoading ? true : undefined}
      level={level}
      className={cn(classes, isLoading ? RESTING_CLASSES : undefined, props.className)}>
      
            {props.content ?? ""}
        </Typography.Heading>);

};

