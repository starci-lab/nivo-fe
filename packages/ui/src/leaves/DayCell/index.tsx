import { skeletonVariants } from "@heroui/react"
import type { LeafProps } from "../../contracts/props"

/**
 * LEAF - `DayCell`: one day of a streak, as a dot with its weekday letter.
 *
 * IT RENDERS AN `<li>` because a run of days IS a list, and the run that lays it out renders the
 * `<ul>`. The pair is held by the two files together - a leaf owns its own element, so there is no
 * third place for the tag to be decided and disagreed with.
 *
 * `title` IS READ AND NOT SEEN. The letter under the dot is one character and cannot say which
 * date it is; the full date is there for assistive technology and for nobody else.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type DayCellData = {
    /** Identity of the column - the ISO date. Used as the key by whoever maps the run. */
    readonly id: string
    /** Already-localized narrow weekday letter. Absent while loading. */
    readonly weekday?: string
    /** Already-localized full date, read out by assistive technology. Absent while loading. */
    readonly title?: string
    /** Whether the learner was active that day. */
    readonly active?: boolean
}

/** Props for {@link DayCell}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type DayCellProps = LeafProps<DayCellData>

/** Stacks the plain circle over its letter. */
const BASE_CLASSES = "flex flex-col items-center gap-1"

/** The circle itself, before the fill that says whether the day was worked. */
const DOT_CLASSES = "size-6 shrink-0 rounded-full"

/** The resting shape - same chip, glyphs out. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * Draw one day.
 *
 * @param input - {@link DayCellProps}
 */
export const DayCell = ({ props, isLoading = false }: DayCellProps) => {
    const dotFill = props.active === true ? "bg-accent/80" : "bg-muted/20"
    const dotClasses = `${DOT_CLASSES} ${isLoading ? RESTING_CLASSES : dotFill}`
    return (
        <li
            data-tier="leaf"
            data-component="DayCell"
            data-part="day"
            data-active={props.active === true ? "true" : "false"}
            data-loading={isLoading ? "true" : "false"}
            className={BASE_CLASSES}
        >
            <span aria-hidden="true" className={dotClasses} />
            <span data-part="weekday" className="text-xs text-muted">
                {props.weekday ?? ""}
            </span>
            <span data-part="date" className="sr-only">
                {props.title ?? ""}
            </span>
        </li>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
