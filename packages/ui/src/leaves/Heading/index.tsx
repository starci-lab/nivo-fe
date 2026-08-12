import { Typography, skeletonVariants } from "@heroui/react"
import type { LeafProps } from "../../contracts/props"

/**
 * LEAF - `Heading`: the name of a thing, at a level of the document outline.
 *
 * `level` DRIVES BOTH THE TAG AND THE SET, so the outline a screen reader walks and the sizes a
 * reader sees can never disagree. A caller raising the level is saying something true about the
 * page, never making the words bigger.
 */

/** How deep in the outline this title sits. Four levels is as deep as a page should go. */
export type HeadingLevel = 1 | 2 | 3 | 4

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type HeadingData = {
    /** The already-resolved title. Absent while loading. */
    readonly content?: string
    /** Which level of the document outline this is. */
    readonly level?: HeadingLevel
}

/** Props for {@link Heading}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type HeadingProps = LeafProps<HeadingData>

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
    4: "text-xs font-medium text-muted",
} as const

/** The resting shape - the same line box with the glyphs out. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/** Resting keeps the level's own metrics, so the line box does not change when text lands. */
const RESTING_LEVEL_CLASSES = {
    1: `${LEVEL_CLASSES[1]} ${RESTING_CLASSES}`,
    2: `${LEVEL_CLASSES[2]} ${RESTING_CLASSES}`,
    3: `${LEVEL_CLASSES[3]} ${RESTING_CLASSES}`,
    4: `${LEVEL_CLASSES[4]} ${RESTING_CLASSES}`,
} as const

/**
 * Draw a title.
 *
 * @param input - {@link HeadingProps}
 */
export const Heading = ({ props, isLoading = false }: HeadingProps) => {
    const level = props.level ?? 2
    return (
        <Typography.Heading
            data-tier="leaf"
            data-component="Heading"
            data-level={level}
            data-loading={isLoading ? "true" : "false"}
            aria-hidden={isLoading ? true : undefined}
            level={level}
            className={isLoading ? RESTING_LEVEL_CLASSES[level] : LEVEL_CLASSES[level]}
        >
            {props.content ?? ""}
        </Typography.Heading>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
